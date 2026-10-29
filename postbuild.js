const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
require('dotenv').config({ path: './build-settings.env' });

const distPath = path.join(__dirname, 'dist', 'custom-module');
const targetPath = path.join(__dirname, 'dist', `${process.env.INST_ID}-${process.env.VIEW_ID}`);
const zipPath = path.join(__dirname, 'dist', `${process.env.INST_ID}-${process.env.VIEW_ID}.zip`);

function removeDirectory(directory, callback) {
    fs.rm(directory, { recursive: true, force: true }, callback);
}

function renameAndArchive() {
    fs.rename(distPath, targetPath, (err) => {
        if (err) throw err;
        console.log(`Renamed directory to ${targetPath}`);

        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`Archive completed: ${archive.pointer()} total bytes`);
            console.log(`Zip file created at: ${zipPath}`);
            console.log('Please upload the zip file to Alma BO custom package section to deploy your custom module.');
        });

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.log('Warning:', err);
            } else {
                throw err;
            }
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);
        archive.directory(targetPath, path.basename(targetPath)); // This ensures the directory itself is included
        archive.finalize();
    });
}

function normalizeManifestPath(filePath, rootDirectory = process.cwd()) {
    const absoluteRoot = path.resolve((rootDirectory || process.cwd()).replace(/\\/g, '/'));
    const relativePath = path.relative(absoluteRoot, path.resolve(filePath.replace(/\\/g, '/')));
    if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        return null;
    }
    return relativePath.split(path.sep).join('/');
}

function collectAssetManifest(root) {
    const files = [];
    const directories = [];
    const stack = [root];
    while (stack.length > 0) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                directories.push(normalizeManifestPath(fullPath, root));
                stack.push(fullPath);
            } else if (entry.isFile() && entry.name !== 'asset-manifest.json') {
                files.push(normalizeManifestPath(fullPath, root));
            }
        }
    }
    return { files: files.sort(), directories: directories.sort() };
}

function writeAssetManifest(root) {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        throw new Error(`Cannot write asset manifest, output directory is missing: ${root}`);
    }
    const manifestPath = path.join(root, 'asset-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(collectAssetManifest(root), null, 2));
    return manifestPath;
}

if (require.main === module) {
    // Check if target directory exists and remove it if it does
    if (fs.existsSync(targetPath)) {
        removeDirectory(targetPath, (err) => {
            if (err) throw err;
            renameAndArchive();
        });
    } else {
        renameAndArchive();
    }
}

module.exports = { writeAssetManifest, normalizeManifestPath, collectAssetManifest };

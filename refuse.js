var fs = require('fs');

var files = [];

var downdate = process.argv.includes("-update");

function refuse(fn) {
	let card_files = [];
	if(fn.match(/skip/)) {
		setTimeout(() => {}, 10)
		return;
	}
	let set_file = fs.readFileSync(`./Set Files/${fn}/set`, {encoding:'utf8'});
	let lines = set_file.split("\n");
	for(let l in lines) {
		let include_match = lines[l].match(/^include[_ ]file: (card [^\n]+)/);
		if(include_match) {
			let cf = `./Set Files/${fn}/${include_match[1]}`;
			card_files.push(cf);
			let card_file = fs.readFileSync(cf, {encoding:'utf8'});
			card_file = card_file.replace(/^[^\n]*mse[_ ]version:[^\n]+\n/, "");
			lines[l] = card_file;
		}
		if(downdate) {
			let update_match = lines[l].match(/!update/)
			let patch_match = lines[l].match(/!update [^ :]: [^\n]+/);
			if(patch_match) {
				lines[l] = lines[l].replace(/!update [^ :]: [^\n]+/, "");
			}else if(update_match) {
				lines[l] = lines[l].replace(/!update/, "");
			}
		}
	}
	fs.writeFile(`./Set Files/${fn}/set`, lines.join("\n"), () => {
		console.log(`./Set Files/${fn} fused`);
		for(let c in card_files) {
			fs.unlink(card_files[c], (err) => {
				if(err)
					console.log(err);
			});
		}
	})
}
fs.readdir("./Set Files", (err, fns) => {
	if(err)
		throw err;
	for(let f in fns) {
		if(fns[f].match(/.mse-set/))
			files.push(fns[f]);
	}
})
process.on('beforeExit', () => {
	if(files.length) {
		try{
			refuse(files[0]);
		}catch(e) {
			console.log(e);
		}
	}
	files.splice(0,1);
})
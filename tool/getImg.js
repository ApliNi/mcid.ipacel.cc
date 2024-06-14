
import { AsyncDB } from "../util/db.js";
import fetch from 'node-fetch';
import fs from 'fs';
import progressStream from 'progress-stream';


// fetch(`https://ipacel.cc/`).then(res => res.text()).then((data) => {
// 	console.log(data);
// });


const getFile = (name, url) => {

	return new Promise(async (resolve) => {

		/* 文件存储地址 */
		let target = `./data/temp/${name}`;
		
		/* 创建文件流 */
		const fileStream = fs.createWriteStream(target).on('error', function(e) {
			console.error('错误', e)
		}).on('finish', function() {
			console.log(`下载完成: ${name}`);
			resolve();
		});
		
		fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/octet-stream'
			},
		}).then(res => {
			/* 获取请求头中的文件大小数据 */
			let length = res.headers.get("content-length");
			res.body.pipe(progressStream({length,time: 100})).pipe(fileStream);
		}).catch(e => {
			//自定义异常处理
			console.log(e);
		});

	});
};

function getImgFromWiki(name){
	// 转换为首字母大写的格式
	name = name.split('_');
	for(let i = 0; i<name.length; i++){
		name[i] = name[i].slice(0,1).toUpperCase() + name[i].slice(1).toLowerCase();
	}
	name = name.join('_');

	return `https://minecraft.wiki/images/thumb/${name}.png/256px-${name}.png?a10cd`;
}


// 查找所有方块
let allItem = await AsyncDB.all(`
	SELECT mcKey.key
	FROM data JOIN mcKey
	ON data.key = mcKey.id
	WHERE
		data.Type = ?
	GROUP BY
		mcKey.key
	LIMIT 99999999;
`, [2]);


// console.log(allItem);

for(let index in allItem){
	const li = allItem[index].key
	console.log(li);
	await getFile(`${li}.png`, getImgFromWiki(li));
}



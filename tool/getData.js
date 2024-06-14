import { logger } from "../util/logger.js";
import fs from "node:fs";
import { MCItemData, MCTypeID } from "../util/Enum.js";
import { getMcKey, sendMcID, getMcName, getLang, getItemData, getMcType } from "../util/dbUtil.js";
import { MCProtocolVersion } from "../util/mcVer.js";
import { listQueryTemp_ver } from "../httpApi/api.list.js";


// 使用方法:
// 1. 设置 assetsRoot 为游戏下载缓存目录
// 2. 下载版本
// 3. 将缓存目录中的 ./indexes/(\d).json 名称改为版本号 xx.xx.xx.json

const assetsRoot = 'C:/Users/ApliNi/Desktop/pcl/.minecraft/assets/';

const reg = {
	getLangName: /minecraft\/lang\/([a-zA-Z0-9_]+)\.json/,
	getMcItemName: /^([a-zA-Z0-9_]+)\.minecraft\.([a-zA-Z0-9_]+)$/,
};


// 清理缓存数据
db.prepare(`DELETE FROM listQueryTemp WHERE ver != ?;`).run(listQueryTemp_ver);


// 运行版本导入
await import('./getVer.js');

logger.info('开始加载数据...');
let i = 0;


// 加载索引文件
let fileArr = fs.readdirSync(`${assetsRoot}/indexes/`);

for(let fileLi in fileArr){
	await new Promise(async (resolve) => {

		const thisVer = MCProtocolVersion.getID(fileArr[fileLi].replace('.json', ''));
		if(thisVer === undefined){
			logger.error(`json: ${fileArr[fileLi]}`);
			resolve();
		}else{
			fs.readFile(`${assetsRoot}/indexes/${fileArr[fileLi]}`, 'utf8', async (err, data) => {
			
				let indexJson = JSON.parse(data).objects;
			
				for(let li in indexJson){
					if(li.indexOf('minecraft/lang/') === 0){
						
						// 将这个语言添加到配置
						const langName = reg.getLangName.exec(li)[1].toLowerCase();
			
						// 获取文件
						const langFile = indexJson[li]['hash'];
						logger.mark(`[${fileArr[fileLi]}] File: ${li} -> ${langFile}`);
						
						// 打开这个文件
						await new Promise(async (_resolve) => {
							fs.readFile(`${assetsRoot}/objects/${langFile.slice(0, 2)}/${langFile}`, 'utf8', async (err, data) => {
								
								let lang = JSON.parse(data);
			
								for(let li in lang){
									let regRet = reg.getMcItemName.exec(li);
									if(regRet !== null && MCTypeID.getID(regRet[1]) !== undefined){
			
										let iM = new MCItemData;
											iM.Key = (await getMcKey(regRet[2], true)).id;
											iM.Lang = (await getLang(langName, true)).id;
											iM.Name = (await getMcName(lang[li], true)).id;
											iM.Type = (await getMcType(regRet[1], true)).id;
			
										// 查找这条记录
										let db_iM = getItemData(iM);
										// console.log(thisVer, db_iM);
										// 调整版本号
										iM.VerMax = db_iM.VerMax < thisVer ? thisVer : db_iM.VerMax;
										iM.VerMin = db_iM.VerMin > thisVer ? thisVer : db_iM.VerMin || thisVer;

										await sendMcID(iM);
									}else{
										_resolve();
									}
								}
							});
						});

					}
				}
			
				resolve();
			});
		}
	});
}

logger.mark('完成');


const lib = {

	// 字符串模板
	splice: (test = '', ...arr) => {
		let i = 0;
		for(const li of arr){
			i ++;
			test = test.replaceAll(`%${i}`, li);
		}
		return test;
	},

	// 正则特殊字符转义
	regEncode: (test) => test.replace(/[\[\(\$\^\.\]\*\\\?\+\{\}\\|\)]/gi, (key) => `\\${key}`),

	getUrlParams: (key) => {
		const i = window.location.search.substring(1).match(new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i'));
		return i ? decodeURIComponent(i[2]) : '';
	},

	replaceParamVal: (key, value) => {
		window.location.href = window.location.href.replace(/('+ key +'=)([^&]*)/gi, `${key}=${value}`);
	},

	// 高亮字符串
	highlightText: (text, word) => {
		if(text.toUpperCase() === word.toUpperCase()){
			return `<span class="highlight -all">${text}</span>`;
		}else{
			return text.replaceAll(new RegExp(`(${lib.regEncode(word)})`, 'ig'), `<span class="highlight -contain">$1</span>`);
		}
	},

	// 获取一个key的图片
	getImageUrl: (type, name) => {

		const _c = {
			'enchantment': './img/item/enchanted_book.png',
			'block': `./img/l2/${name}.png`,
			'item': `./img/l2/${name}.png`,
		};

		return _c[type] || `./img/${type}/${name}.png`;
	},
};


const uiLib = {

	// 复制文本
	copy: (_this) => {
		const text = _this.innerText;
		navigator.clipboard.writeText(text).then(() => {}, (err) => {
			console.error('复制失败 ', err);
		});
	},

	// 跳转到URL
	redirect: (url) => window.location.href = url,

	// 图片加载错误时
	imgOnError: (_this) => {
		_this.src = './img/null.png';
		_this.title = lang['img.notImg'];
	},

	// 图片加载完成
	imgOnLoad: (_this) => {
		// 如果图片任意边长大于 16 则修改渲染模式
		if(_this.naturalWidth > 16 || _this.naturalHeight > 16){
			_this.classList.add('--renderingAuto');
		}

		// 如果所有边长小于等于 16 则不处理
		if(_this.naturalWidth <= 16 && _this.naturalHeight <= 16){}
		// 如果所有边长都小于 120 则修改渲染尺寸
		else if(_this.naturalWidth < 120 && _this.naturalHeight < 120){
			_this.classList.add('--size1');
		}
		// 藤曼
		else if(_this.naturalWidth >= 180 || _this.naturalHeight >= 180){
			_this.classList.add('--size3');
		}
	},

	// 打开一个详细信息Box
	openDetailedBox: (btn, id, _type, _key) => {
		const boxDom = document.getElementById(`li.${id}.detailedBox`);
	
		if(btn.classList.contains('-open')){
			btn.classList.remove('-open');
			boxDom.classList.add('-hide');
		}else{
			if(!boxDom.classList.contains('-load')){
				loadDetailed(id, _type, _key);
				boxDom.classList.add('-load');
			}
			btn.classList.add('-open');
			boxDom.classList.remove('-hide');

			document.getElementById(`li.${id}`).scrollIntoView({ behavior: 'smooth' });
		}
	},
};


// doms
const doms = {
	mainInput: document.getElementById('mainInput'),
	mainList: document.getElementById('list'),
	status: document.getElementById('status'),
	welcome: document.getElementById('welcome'),
	container: document.getElementById('container'),
};


// 显示主体
doms.container.style.opacity = 1;

// 填充欢迎文本
doms.welcome.innerHTML = lang['welcome'];
doms.welcome.classList.remove('-quit');


let temp = {
	renderTime: 0,
	lastQuery: '',
	lastStatusHTML: '',
};


// 加载和渲染数据
const loadList = async (inpData) => {
	const startTime = Date.now();

	temp.lastQuery = inpData;

	const cLangCode = LANG.replaceAll('-', '_').toLocaleLowerCase();

	fetch(`/api.list/?l=${cLangCode}&q=${inpData}`).then(res => res.json()).then((data) => {
		// console.log(data);

		// 如果有一个更新的数据被渲染, 则取消本次的渲染
		if(temp.renderTime > startTime){
			console.log('渲染被取消 ', inpData);
			return;
		}
		temp.renderTime = startTime;

		if(data.time < 1000){
			temp.lastStatusHTML = lib.splice(lang['load.ok'], data.list.length, data.time, lang['time.ms']);
		}else{
			temp.lastStatusHTML = lib.splice(lang['load.ok'], data.list.length, `${(data.time / 1000).toFixed(2)}`.replaceAll(/[0\.]+$/g, ''), lang['time.s']);
		}
		doms.status.innerText = temp.lastStatusHTML;

		// 如果数据不为空
		if(data.list.length !== 0){
			let iM = '';

			// 直接查询ID时删除前面的等号
			if(inpData.indexOf('=') === 0){
				inpData = inpData.substr(1);
			}

			for(const li of data.list){

				iM += `
					<div id="li.${li.id}" class="li">

						<div class="topbar">
							<div class="icon-b"></div>
							<img class="icon -type_${li.type}" loading="lazy"
								onerror="uiLib.imgOnError(this)"
								onload="uiLib.imgOnLoad(this)"
								title="${li.name}" src="${lib.getImageUrl(li.type, li.key)}">
							<div class="control highlightBox">
								<h3 class="startingPoint"></h3>
								<h3 onclick="uiLib.copy(this)" class="-link" title="${lib.splice(lang['click_copy'], li.name)}">${lib.highlightText(li.name, inpData)}</h3>
								<span class="key">
									::
									<span onclick="uiLib.copy(this)" class="-link" title="${lib.splice(lang['click_copy'], li.key)}">
										${lib.highlightText(li.key, inpData)}
									</span>
								</span>
							</div>
						</div>

						<div class="info box">

							<div class="motd highlightBox">
								<p>
									<span class="attr -blue">
										${lib.splice(lang['info.motd.type'], `<span class="v si">${lang[`mcType.${li.type}`]}</span>[${li.type}]`)}
									</span>

									<span class="attr -blue">
										${lib.splice(lang['info.motd.ver'], `<span class="v">${li.VerMax}</span><span class="si ffJBM">&lt-</span><span class="v">${li.VerMin}</span>`)}
									</span>

									<span class="attr -blue">
										${lib.splice(lang['info.motd.lang'],
											li.diffLangs > 0
												? `<span class="v si">${li.lang}</span> ${lib.splice(lang['info.motd.lang.other'], `<span class="v">${li.diffLangs}</span>`)}`
												: `<span class="v si">${li.lang}</span>`
										)}
									</span>
								</p>
								<p>
									<span class="attr -blue">
										${
											li.alias?.length > 0
												? lib.splice(lang['info.motd.alias'],
													`<span class="v">${li.alias.length}</span>`,
													(li.alias.map((li) => `<span onclick="uiLib.copy(this)" class="v si" title="${lib.splice(lang['click_copy'], li.name)}"
													>${lib.highlightText(li.name, inpData)}</span>[<span class="v">${li.VerMax}</span><span class="si ffJBM">&lt-</span><span class="v">${li.VerMin}</span>]`).join(', ')))
												: ''
										}
									</span>
								</p>
							</div>

							<div class="btnBox">
								<button onclick="uiLib.openDetailedBox(this, '${li.id}', '${li.type}', '${li.key}')"
									class="btn right square openDetailed" title="${lang['btn.detailed.title']}">↓</button>
								<a href="https://minecraft.wiki/?search=${li.key}"><button class="btn right">${lang['btn.wiki']}</button></a>
								
							</div>

							<div id="li.${li.id}.detailedBox" class="detailedBox -hide highlightBox"></div>
						</div>
					</div>
				`.replaceAll('	', '').replaceAll('\n', '');

			};

			doms.mainList.innerHTML = iM;
			
		}else{
			doms.mainList.innerHTML = `<p class="aText center">${lang['list.null']}</p>`;
		}
		doms.mainList.classList.remove('-typing');
	});
};


// 加载详细信息
const loadDetailed = (id, _type, _key) => {
	const boxDom = document.getElementById(`li.${id}.detailedBox`);
	boxDom.innerHTML = `
		<div class="dividing"></div>
		<p class="aText center" style="font-size: 12px; margin-top: 24px">${lang['load.ing']}</p>
	`;
	const inpWord = doms.mainInput.value.trim();

	fetch(`/api.detailed/?t=${_type}&k=${_key}`).then(res => res.json()).then((data) => {
		console.log(data);

		boxDom.classList.add('-loadOK');

		let iM = '';

		// 语言
		iM += `
			<details open><summary>${lib.splice(lang['detailed.lang'], Object.keys(data.lang).length)}</summary>
			<div class="d_lang">
		`;
		for(const lang in data.lang){
			let name = `\`${data.lang[lang].nameList.map((i) => lib.highlightText(i, inpWord)).join('\`, \`')}\``;
			iM += `
				<p>${lang} -> ${name}</p>
			`;
		}
		
		iM += `
			</div>
			</details>
		`;

		boxDom.innerHTML = `
			<div class="dividing"></div>
			<div class="content">
				${iM}
				<br />
			</div>
		`;

		document.getElementById(`li.${id}`).classList.add('-openDetailed');
	});

};


// 监听输入框
(() => {

	let keyboardInpTime = 0;
	let timer = null;
	let lock = false;
	function start(time = 400, bypass = false){

		// 如果新旧输入相同则不执行
		if(temp.lastQuery === doms.mainInput.value){
			doms.status.innerText = temp.lastStatusHTML;
			doms.mainList.classList.remove('-typing');
			return;
		}
		
		// 绕过等待
		if(bypass){
			if(timer !== null) clearTimeout(timer);
		}else{
			doms.status.innerText = lang['load.awaitInput'];
			doms.mainList.classList.add('-typing');
			if(lock) return;
			lock = true;
		}

		timer = setTimeout(() => {
			if(bypass === false && keyboardInpTime > (Date.now() - 300)){
				lock = false;
				start();
				return;
			}

			const inpData = doms.mainInput.value.trim();
			
			if(inpData !== '' && inpData !== '='){
				doms.status.innerText = lang['load.ing'];
				loadList(inpData);
			}else{
				temp.lastQuery = '';
				doms.mainList.innerHTML = '';
				doms.status.innerHTML = '&nbsp;';
			}

			lock = false;
		}, time);
	};

	// 第一次加载页面时启动
	if(doms.mainInput.value !== ''){
		start(0, true);
	}
	// 监听输入框
	doms.mainInput.addEventListener('input', () => {
		keyboardInpTime = Date.now();
		start();
	});
	doms.mainInput.addEventListener('keyup', (event) => {
		if(event.key === 'Enter'){
			start(0, true);
		}
	});
})();

// 应用加载完成
doms.status.innerHTML = '&nbsp;';

const runQuery = (text) => {
	doms.mainInput.value = text;
	loadList(text);
};

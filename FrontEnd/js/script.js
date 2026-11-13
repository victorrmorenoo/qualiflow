
const byId = id => document.getElementById(id);

document.querySelectorAll('[data-brand]').forEach(el =>
el.append(byId('brand').content.cloneNode(true))
);

/* DADOS DAS MEDIÇÕES */

const metrics = [
['Massa','g',35,55,48],
['Espessura do ombro','mm',.30,.55,.40],
['Espessura do corpo','mm',.15,.45,.25],
['Espessura dos pés','mm',.22,.60,.35],
['Espessura central do fundo','mm',1.30,2,1.5],
['Rosca do gargalo','mm',23.95,24.45,24.20],
['Corpo do gargalo','mm',27.15,27.65,27.40],
['Altura','mm',347,361,354],
['Volume útil','mL',1970,2030,1970],
['Volume de transbordo','mL',2040,2095,2065]
];

const offsets = [.05,.13,-.08,.17,.02,-.14,.22,.04,-.05,.1,.03,.18,-.10,.06];

const format = (value,digits=2) =>
value.toLocaleString('pt-BR',{maximumFractionDigits:digits});

const classify = (value,lo,hi) =>
value < lo || value > hi ? 2 :
Math.min(value-lo,hi-value) <= (hi-lo)*.05 ? 1 : 0;

const statuses = ['Conforme','Atenção','Fora do padrão'];

/* CORES DOS INDICADORES E GRÁFICOS */

const colors = [
'var(--ok)',
'var(--warn)',
'var(--crit)'
];

const cssClasses = ['','warn','error'];

const shifts = ['Manhã','Tarde','Noite'];

const lines = ['Sopro_01','Sopro_02','Sopro_03','Sopro_04'];

/* DATAS */

const todayParts = new Intl.DateTimeFormat('en',{
timeZone:'America/Sao_Paulo',
year:'numeric',
month:'2-digit',
day:'2-digit'
}).formatToParts();

const part = type =>
Number(todayParts.find(entry=>entry.type===type).value);

const today = Date.UTC(
part('year'),
part('month')-1,
part('day')
);

const dates = Array.from({length:30},(_,day)=>
new Date(today-(29-day)*86400000).toISOString().slice(0,10)
);

const shortDate = date =>
date.slice(8,10)+'/'+date.slice(5,7);

/* PRODUÇÃO */

const production = dates.flatMap((date,day)=>
shifts.flatMap((shift,i)=>
lines.map((line,j)=>({
date,
day,
shift,
line,
group:i*lines.length+j,
consumed:37+(day*5+i*7+j*3)%12,
discarded:(day+i*2+j*3)%3
}))
));

/* GERAÇÃO DAS AMOSTRAS */

const data = production.flatMap(batch=>
metrics.map(([name,unit,lo,hi,target],index)=>{

const center = target===lo ? (lo+hi)/2 : target;

const sample = (batch.day*11+batch.group*13+index*7)%41;

const offset = sample===0 ? -.72 :
sample===1 ? (hi-center)/(hi-lo)-.01 :
offsets[sample%offsets.length];

const value = Math.round((center+offset*(hi-lo))*100)/100;

const id = 1001+
(batch.day*shifts.length*lines.length+batch.group)*metrics.length+index;

return {
...batch,
id,
index,
name,
unit,
value,
status:classify(value,lo,hi)
};

})
);

/* SELECT DE MEDIÇÕES */

byId('metric').innerHTML = metrics.map(([name],i)=>
'<option value="'+i+'">'+name+'</option>'
).join('');

/* TELAS */

const views = {
overview:[
'Controle de qualidade',
'Acompanhe as medições e os desvios das garrafas PET de 2 L.'
],
measurements:[
'Medições',
'Compare os resultados com a faixa de aceitação de cada medida.'
],
inspections:[
'Inspeções',
'Consulte as amostras recentes e filtre pela situação.'
],
costs:[
'Custos e desperdício',
'Confira o gasto com matéria-prima e o custo do PET descartado.'
]
};

/* MENU */

const menuToggle = byId('menuToggle');

function setMenu(open){

byId('sidebar').hidden = !open;

byId('workspace').classList.toggle('menu-closed',!open);

menuToggle.setAttribute('aria-expanded',String(open));

menuToggle.setAttribute(
'aria-label',
open ? 'Fechar menu' : 'Abrir menu'
);

}

menuToggle.onclick = () =>
setMenu(byId('sidebar').hidden);

byId('dashboard').addEventListener('keydown',event=>{

if(event.key==='Escape' && !byId('sidebar').hidden){

setMenu(false);
menuToggle.focus();

}

});

const menu = [...document.querySelectorAll('[data-view]')];

/* TROCA DE TELAS */

function showView(view){

const [title,description] = views[view];

byId('viewTitle').textContent = title;
byId('viewDescription').textContent = description;

menu.forEach(button=>{

if(button.dataset.view===view)
button.setAttribute('aria-current','page');

else
button.removeAttribute('aria-current');

});

document.querySelectorAll('[data-section]').forEach(section=>{

section.hidden =
!section.dataset.section.split(' ').includes(view);

});

}

menu.forEach(button=>
button.addEventListener('click',()=>
showView(button.dataset.view)
));

/* CUSTOS */

const petPrice = 8.40;

const brl = new Intl.NumberFormat('pt-BR',{
style:'currency',
currency:'BRL'
});

function renderCosts(batches){

const consumed = batches.reduce(
(sum,row)=>sum+row.consumed,0
);

const discarded = batches.reduce(
(sum,row)=>sum+row.discarded,0
);

const cards = [

[
'Gasto total com PET',
brl.format(consumed*petPrice),
format(consumed)+' kg consumidos',
''
],

[
'Custo do desperdício',
brl.format(discarded*petPrice),
format(discarded)+' kg descartados',
'error'
],

[
'Taxa de desperdício',
consumed ? format(discarded/consumed*100,1)+'%' : '—',
'do PET consumido',
''
]

];

byId('costCards').innerHTML = cards.map(
([label,value,detail,style])=>
'<div class="card '+style+'">'+
label+
'<strong>'+value+'</strong>'+
'<small class="muted">'+detail+'</small>'+
'</div>'
).join('');

byId('costBreakdown').textContent = !consumed
? 'Sem dados de produção para este recorte.'
: format(consumed)+' kg consumidos × '+
brl.format(petPrice)+
' por kg. Desse total, '+
format(discarded)+' kg foram descartados.';

}

/* FILTROS */

byId('from').value = dates[23];
byId('to').value = dates[29];

/* RENDERIZAÇÃO */

function render(){

const period = byId('period').value;

const custom = period==='custom';

byId('customDates').hidden = !custom;

const from = custom
? byId('from').value
: dates[30-Number(period)];

const to = custom
? byId('to').value
: dates[29];

const valid = Boolean(from && to && from<=to);

const error = byId('filterError');

error.hidden = valid;

error.textContent = valid ? '' :
'Informe as duas datas. A data inicial deve ser anterior ou igual à final.';

const shift = byId('shift').value;
const line = byId('line').value;
const status = byId('statusFilter').value;

const matches = row =>
valid &&
row.date>=from &&
row.date<=to &&
(!shift || row.shift===shift) &&
(!line || row.line===line);

renderCosts(production.filter(matches));

const visible = data.filter(row=>
matches(row) &&
(!status || statuses[row.status]===status)
);

const counts = statuses.map((_,i)=>
visible.filter(row=>row.status===i).length
);

const rate = visible.length
? counts[0]/visible.length*100
: 0;

const split = visible.length
? (counts[0]+counts[1])/visible.length*100
: 0;

const percentage = visible.length
? format(rate,1)+'%'
: '—';

/* INDICADORES SUPERIORES */

const cards = [

['Medições registradas',visible.length,''],

['Conformidade',percentage,''],

['Em atenção',counts[1],'warn'],

['Fora do padrão',counts[2],'error']

];

byId('cards').innerHTML = cards.map(
([label,value,style])=>
'<div class="card '+style+'">'+
label+
'<strong>'+value+'</strong>'+
'</div>'
).join('');

/* GRÁFICO CIRCULAR */

byId('rate').textContent = percentage;

byId('ring').style.background = visible.length
? 'conic-gradient('+
colors[0]+' '+rate+'%, '+
colors[1]+' '+rate+'% '+split+'%, '+
colors[2]+' '+split+'%)'
: 'var(--line)';

byId('legend').innerHTML = statuses.map(
(name,i)=>
'<span class="key" style="--c:'+colors[i]+'">'+
name+' · '+counts[i]+
'</span>'
).join('');

/* TABELA DE INSPEÇÕES */

const recent = visible.slice()
.sort((a,b)=>b.day-a.day || b.status-a.status)
.slice(0,12);

byId('rows').innerHTML = recent.length
? recent.map(row=>
'<tr>'+
'<td>PET-'+row.id+'</td>'+
'<td>'+shortDate(row.date)+'</td>'+
'<td>'+row.shift+'</td>'+
'<td>'+row.line+'</td>'+
'<td>'+row.name+'</td>'+
'<td>'+format(row.value)+' '+row.unit+'</td>'+
'<td><span class="status '+cssClasses[row.status]+'">'+
statuses[row.status]+
'</span></td>'+
'</tr>'
).join('')
: '<tr><td colspan="7">Nenhuma inspeção para os filtros selecionados.</td></tr>';

/* GRÁFICO DE LINHAS */

const chosen = Number(byId('metric').value);

const [name,unit,lo,hi] = metrics[chosen];

byId('limits').textContent =
'Médias diárias · Faixa de aceitação de '+
format(lo)+' a '+format(hi)+' '+unit;

const chartDates = dates.filter(date=>
valid && date>=from && date<=to
);

const trend = chartDates.flatMap((date,i)=>{

const points = visible.filter(row=>
row.index===chosen && row.date===date
);

return points.length
? [{
date,
i,
value:points.reduce((sum,row)=>sum+row.value,0)/points.length
}]
: [];

});

const plot = byId('plot');

plot.setAttribute(
'aria-label',
'Médias diárias de '+name+', em '+unit
);

if(!trend.length){

plot.innerHTML =
'<text x="300" y="122" text-anchor="middle" '+
'fill="#aaa2cc" font-size="20">'+
'Nenhuma medição neste recorte.</text>';

return;

}

const pad = (hi-lo)*.12;

const min = Math.min(
lo,
...trend.map(row=>row.value)
)-pad;

const max = Math.max(
hi,
...trend.map(row=>row.value)
)+pad;

const x = i =>
chartDates.length===1
? 315
: 58+i*515/(chartDates.length-1);

const y = value =>
200-(value-min)*178/(max-min);

/* ÁREA DO GRÁFICO */

plot.innerHTML =

'<defs>'+
'<linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">'+
'<stop offset="0%" stop-color="#a855f7" stop-opacity=".25"/>'+
'<stop offset="100%" stop-color="#7567ff" stop-opacity="0"/>'+
'</linearGradient>'+
'<filter id="purpleGlow">'+
'<feGaussianBlur stdDeviation="3" result="blur"/>'+
'<feMerge>'+
'<feMergeNode in="blur"/>'+
'<feMergeNode in="SourceGraphic"/>'+
'</feMerge>'+
'</filter>'+
'</defs>'+

'<rect x="58" y="'+y(hi)+
'" width="515" height="'+(y(lo)-y(hi))+
'" fill="url(#purpleArea)"/>'+

[hi,(hi+lo)/2,lo].map((v,i)=>
'<line x1="58" x2="573" y1="'+y(v)+
'" y2="'+y(v)+
'" stroke="'+(i===1?'#40345f':'#d66bff')+
'" stroke-dasharray="5 5" opacity=".7"/>'+
'<text x="50" y="'+(y(v)+4)+
'" text-anchor="end" fill="#aaa2cc" font-size="12">'+
format(v)+'</text>'
).join('')+

/* LINHAS E PONTOS */

trend.map((row,i)=>{

const previous = trend[i-1];

const status = classify(row.value,lo,hi);

const segment =
previous && previous.i+1===row.i
? '<line x1="'+x(previous.i)+
'" y1="'+y(previous.value)+
'" x2="'+x(row.i)+
'" y2="'+y(row.value)+
'" stroke="#a78bfa" stroke-width="3" '+
'filter="url(#purpleGlow)" stroke-linecap="round"/>'
: '';

const pointColor =
status===2 ? '#ec4899' :
status===1 ? '#c084fc' :
'#a78bfa';

return segment+
'<circle cx="'+x(row.i)+
'" cy="'+y(row.value)+
'" r="4" stroke="'+pointColor+
'" stroke-width="2" fill="#111426" '+
'filter="url(#purpleGlow)">'+
'<title>'+shortDate(row.date)+
' · '+format(row.value)+' '+unit+
'</title></circle>';

}).join('')+

/* DATAS */

chartDates.map((date,i)=>
i%Math.ceil(chartDates.length/8)===0 ||
i===chartDates.length-1
? '<text x="'+x(i)+
'" y="225" text-anchor="middle" '+
'fill="#aaa2cc" font-size="12">'+
shortDate(date)+'</text>'
: ''
).join('');

}

/* EVENTOS DOS FILTROS */

const filterIds = [
'period',
'shift',
'line',
'statusFilter',
'from',
'to'
];

[...filterIds,'metric'].forEach(id=>
byId(id).addEventListener('change',render)
);

/* LIMPAR FILTROS */

byId('clearFilters').onclick = ()=>{

filterIds.forEach(id=>
byId(id).value =
({period:'7',from:dates[23],to:dates[29]})[id] ?? ''
);

render();

};

/* ENTRAR NO PAINEL */

byId('enter').onclick = ()=>{

const role = byId('role').value;

byId('profile').textContent = role;

byId('signup').hidden = role!=='Gestor';

byId('login').hidden = true;

byId('dashboard').hidden = false;

showView('overview');

setMenu(false);

render();

byId('period').focus();

};

/* SAIR */

byId('exit').onclick = ()=>{

byId('dashboard').hidden = true;

byId('notice').hidden = true;

byId('login').hidden = false;

byId('role').focus();

};

/* CADASTRO */

byId('signup').onclick = ()=>
byId('registration').showModal();

byId('cancel').onclick = ()=>
byId('registration').close();

byId('form').onsubmit = event=>{

event.preventDefault();

byId('notice').textContent =
'Cadastro simulado para '+
event.currentTarget.elements.nome.value.trim()+'.';

byId('notice').hidden = false;

event.currentTarget.reset();

byId('registration').close();

};

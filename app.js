(()=>{
'use strict';
const $=id=>document.getElementById(id);
const defaults={sub:'第 1 页 · 坐标输入 / 火控',title1:'坐标输入 / 计算',sxL:'炮位 X',syL:'炮位 Y',txL:'目标 X',tyL:'目标 Y',calc:'开始计算',clear:'清除坐标',bearingTitle:'方位 Code / 方位角',bearingBtn:'检查',ballisticsBtn:'加载火控表',distL:'距离',azL:'方位角',dirL:'方向',rangeL:'射程状态',milL:'仰角 MIL',arcL:'弹道',setGun:'设置炮位',setTarget:'设置目标',lockGun:'锁定炮位',lockTarget:'锁定目标',clearGun:'清除炮位',clearTarget:'清除目标',resetMap:'重置地图',layersTitle:'地图图层',towerText:'高塔',facilityText:'主要建筑 / 设施',battleText:'主要战场 / 战区',gridText:'1 公里网格',gunLabel:'炮位',targetLabel:'目标',mapHelp:'单指拖动；双指捏合缩放。点击地图设置点位。输入坐标会同步到地图。放大时标记会自动缩小。',nav1:'第 1 页 · 计算',nav2:'第 2 页 · 地图',lang:'EN'};
Object.entries(defaults).forEach(([id,v])=>{const e=$(id);if(e)e.textContent=v});
for(const id of ['nav2','mapSelect']){const old=$(id);if(old){const fresh=old.cloneNode(true);old.replaceWith(fresh)}}
const core=document.createElement('script');core.src='./app-v11.js?v=15';core.dataset.boot='wardogs-v11';
core.onload=()=>{const style=document.createElement('script');style.src='./map-v14-style.js?v=15';style.dataset.boot='wardogs-map-v14-style';style.onload=()=>{const map=document.createElement('script');map.src='./map-v14-fix.js?v=15';map.dataset.boot='wardogs-map-v14';document.head.appendChild(map)};document.head.appendChild(style)};
document.head.appendChild(core);
})();
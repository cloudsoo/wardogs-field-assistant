(()=>{
'use strict';
const $=id=>document.getElementById(id);
const defaults={sub:'第 1 页 · 坐标输入 / 火控',title1:'坐标输入 / 计算',sxL:'炮位 X',syL:'炮位 Y',txL:'目标 X',tyL:'目标 Y',calc:'开始计算',clear:'清除坐标',bearingTitle:'方位 Code / 方位角',bearingBtn:'检查',ballisticsBtn:'加载火控表',distL:'距离',azL:'方位角',dirL:'方向',rangeL:'射程状态',milL:'仰角 MIL',arcL:'弹道',setGun:'设置炮位',setTarget:'设置目标',lockGun:'锁定炮位',lockTarget:'锁定目标',clearGun:'清除炮位',clearTarget:'清除目标',resetMap:'重置地图',layersTitle:'地图图层',towerText:'活动高塔',inactiveTowerText:'Inactive Tower',factionText:'阵营总部',vendorText:'商人 / 补给',spawnText:'出生区',gridText:'1 公里网格',gunLabel:'炮位',targetLabel:'目标',mapHelp:'点击地图设置点位；拖动平移；双指或滚轮缩放。高塔快速定位只用于设定炮位。坐标快速定位使用 X / Y 两个输入框。',nav1:'第 1 页 · 计算',nav2:'第 2 页 · 地图',lang:'EN',p1note:'',mapDataNote:'地图资料：自动读取 WARDOGS calculator community map registry'};
Object.entries(defaults).forEach(([id,v])=>{const e=$(id);if(e)e.textContent=v});
const core=document.createElement('script');core.src='./app-v19.js?v=20';core.dataset.boot='wardogs-v20-core';
core.onload=()=>{const map=document.createElement('script');map.src='./map-v20.js?v=20';map.dataset.boot='wardogs-v20-map';document.head.appendChild(map)};
document.head.appendChild(core);
})();

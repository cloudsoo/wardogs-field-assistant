(()=>{
const css=document.createElement('style');
css.textContent=`
.v13-map-root{position:absolute;inset:0;overflow:hidden;background:#11181e;touch-action:none;user-select:none;-webkit-user-select:none}
.v13-map-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.v13-marker-layer{position:absolute;inset:0;pointer-events:none}
.v13-hud{position:absolute;z-index:50;left:8px;right:8px;top:8px;display:flex;justify-content:space-between;pointer-events:none}
.v13-hud span{background:#04090ddd;border:1px solid #3d5366;border-radius:7px;padding:5px 7px;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#eef4f9}
.v13-tower-marker,.v13-poi-marker{position:absolute;transform:translate(-50%,-78%);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;pointer-events:auto;cursor:pointer;line-height:1}
.v13-tower-marker img{width:calc(28px * var(--k));height:calc(40px * var(--k));object-fit:contain;display:block}
.v13-tower-marker span{font-size:calc(9.5px * var(--k));white-space:nowrap;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000;margin-top:2px;font-weight:800}
.v13-poi-marker{transform:translate(-50%,-50%);color:#dbe9f5;font-weight:800;font-size:calc(9px * var(--k));text-shadow:0 1px 2px #000;white-space:nowrap}
.v13-gun-point,.v13-target-point{position:absolute;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;pointer-events:none;box-sizing:border-box}
.v13-gun-point{border:2px solid #4aa3ff;background:#4aa3ff33;box-shadow:0 0 0 2px #061019aa,0 0 12px #4aa3ff88}
.v13-target-point{border:2px solid #ff727b;background:#ff727b33;box-shadow:0 0 0 2px #061019aa,0 0 12px #ff727b88}
.v13-quick{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.v13-quick>div{background:#0a1118;border:1px solid #243542;border-radius:10px;padding:8px}
.v13-quick b{display:block;color:#93a3b5;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;margin-bottom:6px}
.v13-row{display:grid;grid-template-columns:1fr auto;gap:6px}
.v13-row input,.v13-row select{width:100%;min-width:0;background:#060b10;color:#fff;border:1px solid #2a3b4b;border-radius:8px;padding:9px;font-size:12px}
.v13-row button{padding:9px 11px}
.v13-coord-readout{margin-top:6px;color:#ffd45b;font:900 12px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:right}
.v13-cross{display:none}
@media(max-width:620px){.v13-quick{grid-template-columns:1fr}.v13-quick>div:nth-child(2){display:none}.v13-coord-readout{text-align:left}}
`;
document.head.appendChild(css);
})();

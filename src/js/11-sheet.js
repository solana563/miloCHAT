/* ---- sheet ---- */
function sheet(html){const s=$("sheet");if(!s)return;s.innerHTML=`<div class="sh">${html}</div>`;s.hidden=false}
function closeSheet(){const s=$("sheet");if(s){s.hidden=true;s.innerHTML=""}}
function msgSheet(id){const m=S.msgs.find(z=>String(z.id)===String(id));if(!m||m.tmp)return;S.act=id;const mine=m.sender===uid(),mr=(m.rx||{})[uid()];
  sheet(`<div class="rxs">${RX.map(e=>`<button class="${mr===e?"on":""}" data-a="rx:${e}">${e}</button>`).join("")}</div><button class="it" data-a="mrep">${ic("reply")}Reply</button>${m.kind==="text"?`<button class="it" data-a="mcopy">${ic("copy")}Copy</button>`:""}${mine?`<button class="it rd" data-a="mun">${ic("trash")}Unsend</button>`:""}`)}
async function react(e){const m=S.msgs.find(z=>String(z.id)===String(S.act));closeSheet();if(!m)return;const rx=Object.assign({},m.rx||{}),prevRx=m.rx;if(rx[uid()]===e)delete rx[uid()];else rx[uid()]=e;m.rx=rx;chatPaint();
  try{await api("/rest/v1/"+mtab()+"?id=eq."+m.id,{m:"PATCH",h:{Prefer:"return=minimal"},b:{rx}})}catch(er){m.rx=prevRx;chatPaint();toast("Couldn't react")}}

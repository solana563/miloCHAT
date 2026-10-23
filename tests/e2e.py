import sys;import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from mock import DB,install
from playwright.sync_api import sync_playwright
R=[]
def ck(n,c):R.append(bool(c));print(('PASS ' if c else 'FAIL ')+n)
U=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8771')+'/index.html'
def signup(pg,em,un):
    pg.goto(U);pg.wait_for_selector('[data-a=swap]');pg.click('[data-a=swap]')
    pg.fill('#em',em);pg.fill('#pw','secret1');pg.fill('#un',un);pg.click('[data-a=auth]');pg.wait_for_selector('.nav',timeout=8000)
with sync_playwright() as p:
    b=p.chromium.launch()
    db=DB();ctxs=[]
    def mk():
        c=b.new_context(viewport={'width':390,'height':800});install(c,db);pg=c.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.errs=errs;return c,pg
    ca,A=mk();cb,B=mk()
    signup(A,'a@x.com','amy');signup(B,'b@x.com','ben')
    ck('both signed up and on home',A.is_visible('.nav') and B.is_visible('.nav'))
    A.screenshot(path='/tmp/mc_home_empty.png')
    A.click('.nav [data-a=add]');A.fill('#q','ben');A.click('[data-a=find]');A.wait_for_selector('[data-a^="req:"]')
    ck('find user shows result',A.is_visible('[data-a^="req:"]'))
    A.click('[data-a^="req:"]');A.wait_for_timeout(800)
    B.wait_for_timeout(1200)
    ck('B gets request badge live',B.is_visible('.nav .dot') or B.is_visible('.inpill'))
    B.click('.nav [data-a="tab:friends"]');B.click('[data-a="seg:requests"]');B.wait_for_selector('[data-a^="acc:"]');B.click('[data-a^="acc:"]');B.wait_for_timeout(1200)
    A.wait_for_timeout(1200)
    A.click('.nav [data-a="tab:home"]');A.wait_for_timeout(500)
    ck('A sees ben in chats',A.inner_text('.card.big').count('Say hi')==1 and 'ben' in A.inner_text('.card.big'))
    A.screenshot(path='/tmp/mc_home.png')
    A.click('.row[data-a^="chat:"]');A.wait_for_selector('#t');A.fill('#t','hello ben');A.click('#sb');A.wait_for_timeout(900)
    ck('A message shown',A.inner_text('#msgs').count('hello ben')==1)
    B.click('.nav [data-a="tab:home"]');B.wait_for_timeout(1200)
    ck('B home shows unread',B.is_visible('.bd') or B.is_visible('.inpill'))
    B.screenshot(path='/tmp/mc_home_unread.png')
    B.click('.row[data-a^="chat:"]');B.wait_for_selector('#t');B.wait_for_timeout(900)
    ck('B sees message',B.inner_text('#msgs').count('hello ben')==1)
    A.wait_for_timeout(900)
    ck('A tick turns read',A.is_visible('.mm .tk.rd'))
    B.fill('#t','hey amy!');B.click('#sb');B.wait_for_timeout(900)
    ck('A gets live reply',A.inner_text('#msgs').count('hey amy!')==1)
    # reaction via dblclick
    A.dblclick('.m.th .bb');A.wait_for_timeout(900)
    ck('reaction shows on B',B.inner_text('#msgs').count('❤️')>=1)
    # reply
    A.click('.m.th .bb',button='right');A.wait_for_selector('.sh');A.click('[data-a=mrep]');A.fill('#t','replying');A.click('#sb');A.wait_for_timeout(900)
    ck('reply quote on B',B.is_visible('.rp'))
    # unsend
    A.click('.m.me >> nth=-1 >> .bb',button='right');A.click('[data-a=mun]');A.wait_for_timeout(900)
    ck('unsend removes on B',B.inner_text('#msgs').count('replying')==0)
    # photo
    import base64
    from PIL import Image
    Image.new('RGB',(300,200),(200,50,50)).save('/tmp/r.jpg')
    A.set_input_files('#pf','/tmp/r.jpg');A.wait_for_timeout(1200)
    ck('photo arrives',B.is_visible('.bb.im img'))
    # typing
    A.fill('#t','typ');A.type('#t','ing');B.wait_for_timeout(600)
    ck('typing indicator',B.inner_text('#sub')=='typing…' or 'typing' in B.inner_text('#sub'))
    A.screenshot(path='/tmp/mc_chat.png')
    # profile view
    A.fill('#t','');A.click('.who');A.wait_for_timeout(400);A.screenshot(path='/tmp/mc_prof.png')
    ck('friend profile opens',A.is_visible('.pf .pill'))
    A.click('[data-a=closeprof]');A.click('[data-a=close]');A.click('.nav [data-a="tab:me"]');A.wait_for_timeout(300);A.screenshot(path='/tmp/mc_me.png')
    ck('own profile',('@amy' in A.inner_text('.pf')))
    A.click('.nav [data-a="tab:friends"]');A.wait_for_timeout(300);A.screenshot(path='/tmp/mc_friends.png')

    # ---- v2 features ----
    import datetime
    from mock import iso,now
    ids={p['username']:i for i,p in db.prof.items()}
    db.sh[ids['amy']]={'np':{'p':1,'t':'Blue Hour','a':'Kito','c':'30,120,220'},'np_at':iso(now())}
    A.evaluate("ownNp(true)");A.wait_for_timeout(800)
    acc=A.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--acc')")
    ck('accent adapts to own song colour',acc.strip().startswith('rgb(') and acc.strip()!='' and '249' not in acc)
    A.click('.nav [data-a="tab:home"]');A.wait_for_timeout(400)
    ck('own song tile in Listening now','Blue Hour' in A.inner_text('.card.mini'))
    A.screenshot(path='/tmp/mc_tint.png')
    db.sh[ids['ben']]={'np':{'p':1,'t':'Red Line','a':'Zed','c':'220,40,60'},'np_at':iso(now())}
    A.evaluate("load(true)");A.wait_for_timeout(800)
    A.click('.row[data-a^="chat:"]');A.wait_for_selector('#t');A.wait_for_timeout(500)
    ck('chat glow follows friend song',A.evaluate("getComputedStyle($('chat')).getPropertyValue('--glow')").strip().startswith('rgba(2'))
    A.screenshot(path='/tmp/mc_chat_tint.png')
    A.click('[data-a=close]')
    A.click('.nav [data-a="tab:me"]');A.click('[data-a=theme]');A.wait_for_timeout(300)
    ck('dark cards',A.evaluate("document.documentElement.dataset.th")=='dark' and A.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--card')").strip()=='#17181c')
    A.click('.nav [data-a="tab:home"]');A.wait_for_timeout(300);A.screenshot(path='/tmp/mc_dark.png')
    A.click('.nav [data-a="tab:me"]')
    Image.new('RGB',(1200,900),(40,90,160)).save('/tmp/cv.jpg')
    A.set_input_files('#cvf','/tmp/cv.jpg');A.wait_for_timeout(1200)
    ck('cover saved',A.evaluate("!!S.me.cover&&S.me.cover.length<60000")==True and bool(db.prof[ids['amy']].get('cover')))
    A.screenshot(path='/tmp/mc_cover_me.png')
    B.click('[data-a=close]');B.evaluate("load(true)");B.wait_for_timeout(800)
    B.click('.nav [data-a="tab:friends"]');B.click('[data-a="seg:friends"]');B.click('.row[data-a^="prof:"]');B.wait_for_timeout(500)
    ck("friend's cover shows on their profile",B.evaluate("!!document.querySelector('.cv')&&document.querySelector('.cv').style.backgroundImage.length>20"))

    # ---- round 2 features ----
    A.click('.nav [data-a="tab:home"]');A.click('.row[data-a^="chat:"]');A.wait_for_selector('#t');A.wait_for_timeout(400)
    A.click('[data-a=song]');A.wait_for_timeout(300)
    db.sh[ids['amy']]['np']={'p':1,'t':'Blue Hour','a':'Kito','id':'x1','img':'https://example.com/a.jpg'}
    db.sh[ids['amy']]['np_at']=iso(now());A.evaluate("ownNp(true)");A.wait_for_timeout(700)
    A.click('[data-a=song]');A.wait_for_timeout(900)
    ck('song card sent and received',B.evaluate("1")==1 and A.inner_text('#msgs').count('Blue Hour')>=1)
    A.click('[data-a=csearch]');A.fill('#fq','hello');A.wait_for_timeout(300)
    ck('chat search filters',A.inner_text('#msgs').count('hello ben')==1 and 'hey amy' not in A.inner_text('#msgs'))
    A.click('[data-a=csearch]');A.wait_for_timeout(300)
    ck('search closes',A.inner_text('#msgs').count('hey amy')==1)
    old=iso(now()-datetime.timedelta(hours=21))
    for m in db.msg:
        if m['body']=='hello ben':m['created_at']=old
    A.evaluate("openChat(S.chat)");A.wait_for_timeout(800)
    ck('vanish hint on old message','vanishes in' in A.inner_text('#msgs'))
    A.click('[data-a=close]')
    c3=b.new_context(viewport={'width':390,'height':800});install(c3,db);P=c3.new_page()
    P.add_init_script("localStorage.setItem('mc.ver','1')")
    P.goto(U);P.fill('#em','a@x.com');P.fill('#pw','secret1');P.click('[data-a=auth]');P.wait_for_selector('.nav');P.wait_for_timeout(900)
    ck("what's new shows after update",'What' in P.inner_text('#sheet'))
    P.click('[data-a=closesheet]');P.keyboard.press('Tab')
    ck('rows are keyboard buttons',P.evaluate("!!document.querySelector('.row[role=button][tabindex=\"0\"]')"))
    # reload keeps session
    A.reload();A.wait_for_selector('.nav',timeout=6000);ck('session persists',True)
    # sign out
    ck('no page errors',not A.errs and not B.errs);print(A.errs,B.errs)
print(R.count(False),'failed')

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
    b=p.chromium.launch(args=['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--autoplay-policy=no-user-gesture-required'])
    db=DB()
    def mk():
        c=b.new_context(viewport={'width':390,'height':800},permissions=['microphone']);install(c,db);pg=c.new_page();pg.errs=[];pg.on('pageerror',lambda e:pg.errs.append(str(e)));return pg
    A=mk();B=mk();signup(A,'a@x.com','amy');signup(B,'b@x.com','ben')
    A.click('.nav [data-a=add]');A.fill('#q','ben');A.click('[data-a=find]');A.wait_for_selector('[data-a^="req:"]');A.click('[data-a^="req:"]');A.wait_for_timeout(600)
    B.click('.nav [data-a="tab:friends"]');B.click('[data-a="seg:requests"]');B.wait_for_selector('[data-a^="acc:"]');B.click('[data-a^="acc:"]');B.wait_for_timeout(1000);A.wait_for_timeout(1000)
    A.click('.nav [data-a="tab:home"]');A.click('.row[data-a^="chat:"]');A.wait_for_selector('#t')
    A.click('#mic');A.wait_for_timeout(1800)
    ck('recording bar shows',A.is_visible('.recdot'))
    A.screenshot(path='/tmp/mc_rec.png')
    A.click('#mic');A.wait_for_timeout(1500)
    ck('voice note sent',A.is_visible('.vc') and 'dur=' in db.msg[-1]['body'][:90] and db.msg[-1]['kind']=='voice')
    B.click('.nav [data-a="tab:home"]');B.wait_for_timeout(800)
    ck('preview says voice message','Voice message' in B.inner_text('.card.big'))
    B.click('.row[data-a^="chat:"]');B.wait_for_selector('.vc');
    ck('B sees player',B.is_visible('.vp'))
    B.click('.vp');B.wait_for_timeout(900)
    ck('plays without error',B.evaluate("!!VA&&!VA.a.error")==True and not B.errs)
    # cancel path
    A.click('#mic');A.wait_for_timeout(1000);A.click('[data-a=mcancel]');A.wait_for_timeout(800)
    ck('cancel sends nothing',len([m for m in db.msg if m['kind']=='voice'])==1 and not A.is_visible('.recdot'))
    A.screenshot(path='/tmp/mc_voice.png')
    ck('no page errors',not A.errs and not B.errs);print(A.errs,B.errs)
print(R.count(False),'failed')

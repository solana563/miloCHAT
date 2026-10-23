import sys;import os;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from mock import DB,install
from playwright.sync_api import sync_playwright
R=[]
def ck(n,c):R.append(bool(c));print(('PASS ' if c else 'FAIL ')+n)
U=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8771')+'/index.html'
def signup(pg,em,un):
    pg.goto(U);pg.wait_for_selector('[data-a=swap]');pg.click('[data-a=swap]')
    pg.fill('#em',em);pg.fill('#pw','secret1');pg.fill('#un',un);pg.click('[data-a=auth]');pg.wait_for_selector('.nav',timeout=8000)
def befriend(a,b,un):
    a.click('.nav [data-a=add]');a.fill('#q',un);a.click('[data-a=find]');a.wait_for_selector('[data-a^="req:"]');a.click('[data-a^="req:"]');a.wait_for_timeout(500)
    b.click('.nav [data-a="tab:friends"]');b.click('[data-a="seg:requests"]');b.wait_for_selector('[data-a^="acc:"]');b.click('[data-a^="acc:"]');b.wait_for_timeout(800);a.wait_for_timeout(800)
    a.click('.nav [data-a="tab:home"]');b.click('.nav [data-a="tab:home"]')
with sync_playwright() as p:
    b=p.chromium.launch()
    db=DB()
    def mk():
        c=b.new_context(viewport={'width':390,'height':800});install(c,db);pg=c.new_page();pg.errs=[];pg.on('pageerror',lambda e:pg.errs.append(str(e)));return pg
    A=mk();B=mk();C=mk()
    signup(A,'a@x.com','amy');signup(B,'b@x.com','ben');signup(C,'c@x.com','cat')
    befriend(A,B,'ben');befriend(A,C,'cat')
    A.click('[data-a=newgroup]');A.wait_for_selector('.gpick')
    ck('friend picker lists 2',A.locator('.gpick input').count()==2)
    A.fill('#gn','Road Trip');A.locator('.gpick input').nth(0).check();A.locator('.gpick input').nth(1).check()
    A.wait_for_timeout(9000)  # repaint while form open must not wipe it
    ck('form survives repaint',A.input_value('#gn')=='Road Trip' and A.locator('.gpick input:checked').count()==2)
    A.click('[data-a=gcreate]');A.wait_for_selector('#t');A.wait_for_timeout(600)
    ck('group opened with members subtitle','3 members' in A.inner_text('#sub'))
    A.screenshot(path='/tmp/mc_group_new.png')
    A.fill('#t','who is driving?');A.click('#sb');A.wait_for_timeout(900)
    B.wait_for_timeout(1200)
    ck('B gets group in list with unread',('Road Trip' in B.inner_text('.card.big')) and B.is_visible('.row .bd'))
    B.click('.row[data-a^="chat:g:"]');B.wait_for_selector('#t');B.wait_for_timeout(700)
    ck('B sees message',B.inner_text('#msgs').count('who is driving?')==1)
    ck('sender name shown to B','amy' in B.inner_text('#msgs'))
    B.fill('#t','me!');B.click('#sb');B.wait_for_timeout(900)
    C.click('.row[data-a^="chat:g:"]');C.wait_for_selector('#t');C.wait_for_timeout(700)
    ck('C sees B name (not C friend)','ben' in C.inner_text('#msgs') and C.inner_text('#msgs').count('me!')==1)
    C.dblclick('.m.th >> nth=0 >> .bb');C.wait_for_timeout(900)
    ck('reaction syncs to A',A.inner_text('#msgs').count('❤️')>=1)
    A.wait_for_timeout(500)
    ck('A live gets B msg',A.inner_text('#msgs').count('me!')==1)
    # typing
    B.fill('#t','');B.type('#t','abc');A.wait_for_timeout(600);ck('typing shows',A.inner_text('#sub')=='typing…')
    A.screenshot(path='/tmp/mc_group_chat.png')
    # unsend
    A.click('.m.me >> nth=-1 >> .bb',button='right');A.click('[data-a=mun]');A.wait_for_timeout(900)
    ck('unsend removes for others',B.inner_text('#msgs').count('who is driving?')==0)
    # info + add/remove
    A.click('.who');A.wait_for_selector('.gml');A.screenshot(path='/tmp/mc_group_info.png')
    ck('members listed',A.locator('.gml .it').count()==3)
    A.click('[data-a^="grm:"] >> nth=0');A.wait_for_timeout(900)
    ck('member removed',A.locator('.gml .it').count()==2)
    ck('removed user kicked out live',not (B.is_visible('#chat:not([hidden]) #t') and C.is_visible('#chat:not([hidden]) #t')))
    # non-owner leave
    A.click('.sh .it >> text=Delete group');A.once('dialog',lambda d:d.accept())
    A.on('dialog',lambda d:d.accept());A.click('[data-a^="gdel:"]');A.wait_for_timeout(1000)
    ck('group deleted',len(db.groups)==0)
    B.wait_for_timeout(1200);ck('gone for member too','Road Trip' not in B.inner_text('.card.big') if B.is_visible('.card.big') else True)
    ck('no page errors',not (A.errs or B.errs or C.errs));print(A.errs,B.errs,C.errs)
print(R.count(False),'failed')

import json,re,time,uuid,urllib.parse
from datetime import datetime,timezone,timedelta
def now():return datetime.now(timezone.utc)
def iso(d):return d.isoformat().replace('+00:00','Z')
class DB:
    def __init__(s):
        s.groups=[];s.gm={};s.gmsg=[];s.users={};s.prof={};s.fr=[];s.sh={};s.msg=[];s.sync={};s.mid=0;s.log=[];s.ws=[];s.rt=True
    def emit(s,table,typ,rec,users,old=None):
        if not s.rt:return
        for w,uid,topics in list(s.ws):
            if uid in users and 'realtime:milo-inbox' in topics:
                try:w.send(json.dumps({'topic':'realtime:milo-inbox','event':'postgres_changes','payload':{'ids':[1],'data':{'schema':'public','table':table,'type':typ,'record':rec,'old_record':old or {}}},'ref':None}))
                except Exception:pass
CAP=5242880
H={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*','content-type':'application/json'}
def install(ctx,db):
    def handler(route):
        req=route.request;u=urllib.parse.urlparse(req.url);path=u.path;q=urllib.parse.parse_qs(u.query,keep_blank_values=True);m=req.method
        if m=='OPTIONS':return route.fulfill(status=204,headers=H,body='')
        def out(j,st=200):route.fulfill(status=st,headers=H,body=json.dumps(j))
        auth=req.headers.get('authorization','');tok=auth.replace('Bearer ','');uid=tok[4:] if tok.startswith('tok-') else None
        try:body=json.loads(req.post_data) if req.post_data else {}
        except Exception:body={}
        db.log.append((m,path,u.query[:80]))
        if path=='/auth/v1/signup':
            e=body['email']
            if any(x['email']==e for x in db.users.values()):return out({'msg':'User already registered'},422)
            un=((body.get('data') or {}).get('username') or '').lower()
            if un and any(p['username']==un for p in db.prof.values()):return out({'msg':'Database error saving new user'},500)
            i=str(uuid.uuid4());db.users[i]={'email':e,'pw':body['password']}
            if un:db.prof[i]={'id':i,'username':un,'name':(body.get('data') or {}).get('name') or un,'av':{},'terms_v':0,'terms_at':None,'share_pl':True,'share_np':True}
            return out({'access_token':'tok-'+i,'refresh_token':'r-'+i,'expires_in':3600,'user':{'id':i,'email':e}})
        if path=='/auth/v1/token':
            if q.get('grant_type')==['password']:
                for i,x in db.users.items():
                    if x['email']==body['email']:
                        if x['pw']==body['password']:return out({'access_token':'tok-'+i,'refresh_token':'r-'+i,'expires_in':3600,'user':{'id':i,'email':x['email']}})
                return out({'error_description':'Invalid login credentials'},400)
            i=body['refresh_token'][2:];return out({'access_token':'tok-'+i,'refresh_token':'r-'+i,'expires_in':3600,'user':{'id':i,'email':db.users[i]['email']}})
        if path=='/rest/v1/rpc/push_save':db.__dict__.setdefault('push',[]).append(body);return out(None,204)
        if path=='/rest/v1/rpc/username_free':return out(not any(p['username']==body['u'].lower() for p in db.prof.values()))
        if not uid:return out({'message':'no auth'},401)
        def friends(a,b):return any(f['status']=='accepted' and {f['a'],f['b']}=={a,b} for f in db.fr)
        if path=='/rest/v1/rpc/find_user':
            r=[{k:p[k] for k in('id','username','name','av')} for p in db.prof.values() if p['username']==body['u'].lower()];return out(r)
        if path=='/rest/v1/rpc/delete_me':
            db.users.pop(uid,None);db.prof.pop(uid,None);db.fr=[f for f in db.fr if uid not in(f['a'],f['b'])];return out(None,204)
        if path=='/rest/v1/profiles':
            if m=='GET':
                r=list(db.prof.values())
                if 'id' in q:
                    v=q['id'][0]
                    if v.startswith('eq.'):r=[p for p in r if p['id']==v[3:]]
                    elif v.startswith('in.('):ids=v[4:-1].split(',');r=[p for p in r if p['id'] in ids]
                return out(r)
            if m=='POST':
                if any(p['username']==body['username'] for p in db.prof.values()):return out({'code':'23505','message':'duplicate key'},409)
                db.prof[uid]=dict({'av':{},'terms_v':0,'terms_at':None,'share_pl':True,'share_np':True},**body);return out(None,201)
            if m=='PATCH':
                i=q['id'][0][3:]
                if i!=uid:return out([])
                db.prof[i].update(body);return out(None,204)
        if path=='/rest/v1/friendships':
            if m=='GET':
                r=[f for f in db.fr if uid in(f['a'],f['b'])];return out(r)
            if m=='POST':
                if body['a']!=uid:return out({'message':'rls'},403)
                if any({f['a'],f['b']}=={body['a'],body['b']} for f in db.fr):return out({'code':'23505','message':'duplicate key'},409)
                f_={'a':body['a'],'b':body['b'],'status':'pending','created_at':iso(now())};db.fr.append(f_);db.emit('friendships','INSERT',f_,{f_['a'],f_['b']});return out(None,201)
            if m=='PATCH':
                a=q['a'][0][3:];b=q['b'][0][3:]
                for f in db.fr:
                    if f['a']==a and f['b']==b and b==uid:f['status']='accepted';db.emit('friendships','UPDATE',dict(f),{f['a'],f['b']})
                return out(None,204)
            if m=='DELETE':
                o=q['or'][0];ids=re.findall(r'[0-9a-f-]{36}',o);x,y=ids[0],ids[1]
                n=len(db.fr);db.fr=[f for f in db.fr if {f['a'],f['b']}!={x,y}]
                ch=':'.join(sorted([x,y]));db.msg=[mm for mm in db.msg if mm['chat']!=ch];return out(None,204)
        if path=='/rest/v1/shared':
            if m=='GET':
                ids=q['user_id'][0][4:-1].split(',');return out([dict(user_id=i,**db.sh[i]) for i in ids if i in db.sh and (i==uid or friends(uid,i))])
            if m=='POST':
                r=db.sh.setdefault(body['user_id'],{});r.update({k:v for k,v in body.items() if k!='user_id'});return out(None,201)
        if path=='/rest/v1/messages':
            def pv(x):return x['body'][:80] if x['kind']=='text' else x['body'][:300] if x['kind']=='song' else None
            if m=='GET':
                cut=now()-timedelta(days=1);r=[x for x in db.msg if uid in(x['sender'],x['rcpt']) and x['created_at']>iso(cut)]
                if 'chat' in q:r=[x for x in r if x['chat']==q['chat'][0][3:]]
                if 'rcpt' in q:r=[x for x in r if x['rcpt']==q['rcpt'][0][3:]]
                r.sort(key=lambda x:x['created_at'],reverse=('order' in q and 'desc' in q['order'][0]))
                if 'select' in q and 'body' not in q['select'][0]:r=[{k:v for k,v in dict(x,pv=pv(x)).items() if k!='body'} for x in r]
                return out(r)
            if m=='POST':
                if not friends(uid,body['rcpt']):return out({'message':'rls'},403)
                b=len(body['body'].encode())+64
                if b>400000:return out({'message':'message_too_large'},400)
                if getattr(db,'failnext',0):db.failnext-=1;return out({'message':'boom'},500)
                ch=':'.join(sorted([uid,body['rcpt']]));db.mid+=1
                rt=body.get('reply_to');rt=rt if any(x['id']==rt and x['chat']==ch for x in db.msg) else None
                rec={'id':db.mid,'chat':ch,'sender':uid,'rcpt':body['rcpt'],'kind':body['kind'],'body':body['body'],'bytes':b,'created_at':iso(now()),'read_at':None,'reply_to':rt,'rx':{}}
                db.msg.append(rec)
                cut=iso(now()-timedelta(days=1));db.msg=[x for x in db.msg if not(x['chat']==ch and x['created_at']<cut)]
                mine=sorted([x for x in db.msg if x['chat']==ch],key=lambda x:x['id'],reverse=True);run=0;drop=set()
                for x in mine:
                    run+=x['bytes']
                    if run>CAP:drop.add(x['id'])
                db.msg=[x for x in db.msg if x['id'] not in drop]
                db.emit('messages','INSERT',dict(rec,pv=pv(rec)),{uid,body['rcpt']})
                if 'representation' in req.headers.get('prefer',''):return out([{k:rec[k] for k in('id','created_at','bytes')}],201)
                return out(None,201)
            if m=='PATCH':
                n=0
                for x in db.msg:
                    ok=uid in(x['sender'],x['rcpt'])
                    if 'id' in q:ok=ok and str(x['id'])==q['id'][0][3:]
                    if 'rcpt' in q:ok=ok and x['rcpt']==q['rcpt'][0][3:]
                    if 'sender' in q:ok=ok and x['sender']==q['sender'][0][3:]
                    if 'read_at' in q and q['read_at'][0]=='is.null':ok=ok and x['read_at'] is None
                    if not ok:continue
                    if 'read_at' in body and x['rcpt']==uid and x['read_at'] is None:x['read_at']=body['read_at']
                    if 'rx' in body:
                        o={k:v for k,v in x['rx'].items() if k!=uid};nn={k:v for k,v in body['rx'].items() if k!=uid}
                        if o!=nn:return out({'message':'rx_locked'},400)
                        x['rx']=body['rx']
                    n+=1;db.emit('messages','UPDATE',dict(x,pv=pv(x)),{x['sender'],x['rcpt']})
                return out(None,204)
            if m=='DELETE':
                i=q['id'][0][3:];gone=[x for x in db.msg if str(x['id'])==i and x['sender']==uid];db.msg=[x for x in db.msg if x not in gone]
                for x in gone:db.emit('messages','DELETE',{'id':x['id']},{x['sender'],x['rcpt']})
                return out(None,204)
        if path=='/rest/v1/groups':
            if m=='GET':return out([g for g in db.groups if uid in db.gm.get(g['id'],set()) or g['owner']==uid])
            if m=='POST':
                g={'id':str(uuid.uuid4()),'name':body['name'],'owner':uid,'created_at':iso(now())};db.groups.append(g);db.gm[g['id']]={uid};db.emit('groups','INSERT',g,{uid})
                return out([g],201) if 'representation' in req.headers.get('prefer','') else out(None,201)
            if m=='DELETE':
                i=q['id'][0][3:]
                for x in [x for x in db.groups if x['id']==i and x['owner']==uid]:
                    users=set(db.gm.get(i,set()));db.groups.remove(x);db.gm.pop(i,None);db.gmsg=[mm for mm in db.gmsg if mm['gid']!=i];db.emit('groups','DELETE',{'id':i},users)
                return out(None,204)
        if path=='/rest/v1/group_members':
            if m=='GET':return out([{'gid':g,'uid':u} for g,st in db.gm.items() if uid in st for u in st])
            if m=='POST':
                rows=body if isinstance(body,list) else [body]
                for r_ in rows:
                    g=next((x for x in db.groups if x['id']==r_['gid']),None)
                    if not g or g['owner']!=uid or not(r_['uid']==uid or friends(uid,r_['uid'])):return out({'message':'rls'},403)
                    if len(db.gm[r_['gid']])>=20:return out({'message':'group_full'},400)
                    db.gm[r_['gid']].add(r_['uid']);db.emit('group_members','INSERT',{'gid':r_['gid'],'uid':r_['uid']},set(db.gm[r_['gid']]))
                return out(None,201)
            if m=='DELETE':
                g=q['gid'][0][3:];u=q['uid'][0][3:];owner=next((x['owner'] for x in db.groups if x['id']==g),None)
                if u==uid or owner==uid:
                    users=set(db.gm.get(g,set()));db.gm.get(g,set()).discard(u);db.emit('group_members','DELETE',{'gid':g,'uid':u},users)
                return out(None,204)
        if path=='/rest/v1/group_msgs':
            def pv(x):return x['body'][:80] if x['kind']=='text' else x['body'][:300] if x['kind']=='song' else None
            if m=='GET':
                cut=iso(now()-timedelta(days=1));r=[x for x in db.gmsg if uid in db.gm.get(x['gid'],set()) and x['created_at']>cut]
                if 'gid' in q:r=[x for x in r if x['gid']==q['gid'][0][3:]]
                r.sort(key=lambda x:x['id'],reverse=('order' in q and 'desc' in q['order'][0]))
                if 'select' in q and 'body' not in q['select'][0]:r=[{k:v for k,v in dict(x,pv=pv(x)).items() if k!='body'} for x in r]
                return out(r)
            if m=='POST':
                if uid not in db.gm.get(body['gid'],set()):return out({'message':'rls'},403)
                db.mid+=1;rt=body.get('reply_to');rt=rt if any(x['id']==rt and x['gid']==body['gid'] for x in db.gmsg) else None
                rec={'id':db.mid,'gid':body['gid'],'sender':uid,'kind':body['kind'],'body':body['body'],'bytes':len(body['body'].encode())+64,'created_at':iso(now()),'reply_to':rt,'rx':{}}
                if rec['bytes']>400000:return out({'message':'message_too_large'},400)
                db.gmsg.append(rec);db.emit('group_msgs','INSERT',dict(rec,pv=pv(rec)),set(db.gm[body['gid']]))
                return out([{k:rec[k] for k in('id','created_at','bytes')}],201) if 'representation' in req.headers.get('prefer','') else out(None,201)
            if m=='PATCH':
                i=q['id'][0][3:]
                for x in db.gmsg:
                    if str(x['id'])==i and uid in db.gm.get(x['gid'],set()) and 'rx' in body:
                        o={k:v for k,v in x['rx'].items() if k!=uid};nn={k:v for k,v in body['rx'].items() if k!=uid}
                        if o!=nn:return out({'message':'rx_locked'},400)
                        x['rx']=body['rx'];db.emit('group_msgs','UPDATE',dict(x,pv=pv(x)),set(db.gm[x['gid']]))
                return out(None,204)
            if m=='DELETE':
                i=q['id'][0][3:]
                for x in [x for x in db.gmsg if str(x['id'])==i and x['sender']==uid]:db.gmsg.remove(x);db.emit('group_msgs','DELETE',{'id':x['id']},set(db.gm.get(x['gid'],set())))
                return out(None,204)
        if path=='/rest/v1/milo_sync':
            if m=='GET':return out([db.sync[uid]] if uid in db.sync else [])
            if m=='POST':
                db.sync[uid]={'data':body['data'],'updated_at':body['updated_at']};db.emit('milo_sync','UPDATE',{'user_id':uid,'updated_at':body['updated_at']},{uid});return out(None,201)
        return out({'message':'unmocked '+path},404)
    def wsh(w):
        ent=[w,None,set()];db.ws.append(tuple(ent))
        st={'uid':None,'topics':set()}
        def upd():
            for i,e in enumerate(db.ws):
                if e[0] is w:db.ws[i]=(w,st['uid'],st['topics'])
        def onmsg(raw):
            try:m=json.loads(raw)
            except Exception:return
            ev=m.get('event');tp=m.get('topic')
            if ev=='phx_join':
                tok=(m.get('payload') or {}).get('access_token','');st['uid']=tok[4:] if tok.startswith('tok-') else None;st['topics'].add(tp);upd()
                w.send(json.dumps({'topic':tp,'event':'phx_reply','payload':{'status':'ok' if db.rt else 'error','response':{}},'ref':m.get('ref')}))
            elif ev=='phx_leave':st['topics'].discard(tp);upd()
            elif ev=='broadcast':
                for w2,u2,t2 in list(db.ws):
                    if w2 is not w and tp in t2:
                        try:w2.send(json.dumps({'topic':tp,'event':'broadcast','payload':m['payload'],'ref':None}))
                        except Exception:pass
        w.on_message(onmsg)
        w.on_close(lambda *a:setattr(db,'ws',[e for e in db.ws if e[0] is not w]))
    ctx.route_web_socket('**/realtime/v1/websocket**',wsh)
    ctx.route('**/lwcypxiwkgphuekygrps.supabase.co/**',handler)

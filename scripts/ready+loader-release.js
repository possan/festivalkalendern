window.ready=function(){var d=window,a={b:[],d:!1,c:!1};a.a=function(){if(!a.c){a.c=!0;for(var b=0;b<a.b.length;b++){var c=a.b[b];try{c.e.apply(c.scope)}catch(d){}}a.b=[]}};if(!a.d){a.d=!0;var b=document;b.readyState==="complete"?setTimeout(a.a,1):b.addEventListener?(b.addEventListener("load",a.a,!1),b.addEventListener("DOMContentLoaded",a.a,!1)):b.attachEvent&&(b.attachEvent("onload",a.a),b.attachEvent("onreadystatechange",a.a),d.attachEvent("onload",a.a))}return function(b){var c=this.callee?this.callee:
this;a.c?setTimeout(function(){b.apply(c)},1):a.b.push({e:b,scope:c})}}();
window.Loader=function(e){var a={scope:this.callee,p:"js",root:"",a:{l:[],loaded:[],z:[]},u:!1},g={};a.log=function(){};if(e&&e.root)a.root=e.root;if(e&&e.extension)a.p=e.extension;if(e&&e.nocache)a.u=e.nocache;a.h=[];a.g=function(b){a.h.push(b)};a.A=function(){if(!(a.h.length<1)){var b=a.h.splice(0,1)[0];b.q(b)}};a.f=-1;a.b=function(){var b;a.f!=-1&&clearTimeout(a.f);typeof b=="undefined"&&(b=1);a.f=setTimeout(function(){a.f=-1;a.A()},b)};a.j=!1;a.D=function(){if(window.XMLHttpRequest)return new XMLHttpRequest;
else if(window.ActiveXObject)if(a.j)return new ActiveXObject(a.j);else for(var b=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.5.0","Msxml2.XMLHTTP.4.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++)try{var d=new ActiveXObject(b[c]);if(d)return a.j=b[c],d}catch(h){}return!1};a.L=function(b,c){var d=c?c:{};if(typeof c=="function")d={},d.c=c;var h=this,e=d.method||"get",f=a.D();if(typeof f!="undefined")d.error=d.error&&typeof d.error=="function"?d.error:function(){},f.onreadystatechange=
function(){f.readyState==4&&((f.status===0||f.status==200)&&d.c.apply(f,[h]),/^[45]/.test(f.status)&&d.error.apply(f))},f.open(e,b,!0),h.M=f,f.send("")};a.C=function(b){b=a.root+b+"."+a.p;a.u&&(b+="?dummy="+escape(Math.random()));return b};if(!Array.indexOf)Array.prototype.indexOf=function(b,a){for(var d=a||0;d<this.length;d++)if(this[d]==b)return d;return-1};Array.prototype.H=function(b){for(var a=!1,d=0;d<this.length;d++){var h=b(this[d],d);a|=h}return a};Array.prototype.all=function(a){a=Array.n(a);
if(a.length<1)return!0;if(this.length<1)return!1;var c=this;return!a.H(function(a){return c.indexOf(a)==-1})};Array.n=function(a){if(typeof a!="undefined")return typeof a=="string"&&(a=[a]),a};Array.prototype.m=function(a,c){a=Array.n(a);typeof c=="undefined"&&(c=!0);for(var d=0;d<a.length;d++){var h=a[d],e=this.indexOf(h);e==-1&&c?this.push(h):e!=-1&&!c&&this.splice(e,1)}};Array.prototype.i=function(a){this.m(a,!0)};Array.prototype.J=function(a){this.m(a,!1)};a.G=function(b){a.a.z.i(b)};a.e=function(b){return a.a.z.all(b)};
a.F=function(b){a.a.loaded.i(b)};a.r=function(b){return a.a.loaded.all(b)};a.t=function(b,c){typeof c=="undefined"&&(c=!0);c?a.a.l.i(b):a.a.l.J(b)};a.s=function(b){return a.a.l.all(b)};a.o=function(b){var c=[],d={};d.requires=function(a){typeof a=="string"&&(a=[a]);c=a;return d};d.provides=function(e,g){var f={c:g,a:c,d:e};a.w(g,c,e,f);a.F(e);b(f);c=[];return d};return d};a.K=function(b){var c=b.d;a.e(c)||a.s(c)||a.r(c)?a.b():(a.t(c,!0),a.L(a.C(c),{c:function(){a.t(c,!1);var b=this;(function(){(new Function("module",
"loader",b.responseText)).apply(this,[a.o(function(){}),g])})();a.b()},error:function(){a.g(b);a.b()}}))};a.B=function(b){a.e(b.a)?(b.c.apply(a.scope),typeof b.d!="undefined"&&a.G(b.d)):(a.v(b.a),a.g(b));a.b()};a.w=function(b,c,d,e){a.g({q:a.B,item:e,c:b,a:c,d:d})};a.I=function(b){a.g({q:a.K,d:b})};a.v=function(b){if(typeof b!="undefined"){typeof b=="string"&&(b=[b]);for(var c=0;c<b.length;c++){var d=b[c];a.r(d)||a.e(d)||a.s(d)||a.I(d)}}};a.k=function(b,c){typeof c=="string"&&(c=[c]);typeof c=="undefined"&&
(c=[]);a.e(c)?b.apply(a.scope):a.w(b,c,void 0,void 0);a.b()};g.module=a.o(function(){});g.load=function(b){a.v(b);a.b()};g.requires=function(b,c){a.k(c,b)};g.require=function(b,c){a.k(c,b)};g.run=function(b,c){a.k(b,c)};a.b();return g};
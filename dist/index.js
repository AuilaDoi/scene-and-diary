// node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function e(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var t = process.env.NODE_ENV === "production" ? {} : Object.freeze({}), n = process.env.NODE_ENV === "production" ? [] : Object.freeze([]), r = () => {}, i = () => !1, a = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), o = (e) => e.startsWith("onUpdate:"), s = Object.assign, c = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => x(e) === "[object Map]", p = (e) => x(e) === "[object Set]", m = (e) => x(e) === "[object Date]", h = (e) => typeof e == "function", g = (e) => typeof e == "string", _ = (e) => typeof e == "symbol", v = (e) => typeof e == "object" && !!e, y = (e) => (v(e) || h(e)) && h(e.then) && h(e.catch), b = Object.prototype.toString, x = (e) => b.call(e), S = (e) => x(e).slice(8, -1), C = (e) => x(e) === "[object Object]", ee = (e) => g(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, w = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), te = /* @__PURE__ */ e("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"), T = 1e4, E = (e) => {
	let t = /* @__PURE__ */ Object.create(null), n = 0;
	return ((r) => {
		let i = t[r];
		return i === void 0 ? (++n > T && (t = /* @__PURE__ */ Object.create(null), n = 1), t[r] = e(r)) : i;
	});
}, ne = /-\w/g, D = /* @__PURE__ */ E((e) => e.replace(ne, (e) => e.slice(1).toUpperCase())), O = /\B([A-Z])/g, k = /* @__PURE__ */ E((e) => e.replace(O, "-$1").toLowerCase()), re = /* @__PURE__ */ E((e) => e.charAt(0).toUpperCase() + e.slice(1)), A = /* @__PURE__ */ E((e) => e ? `on${re(e)}` : ""), j = (e, t) => !Object.is(e, t), ie = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, ae = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, oe = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, se, ce = () => se ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function le(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? pe(r) : le(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var ue = /;(?![^(]*\))/g, de = /:([^]+)/, fe = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function pe(e) {
	let t = {};
	return e.replace(fe, (e) => e.startsWith("/*") ? "" : e).split(ue).forEach((e) => {
		if (e) {
			let n = e.split(de);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function me(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = me(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var he = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot", ge = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view", _e = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics", ve = /* @__PURE__ */ e(he), ye = /* @__PURE__ */ e(ge), be = /* @__PURE__ */ e(_e), xe = /* @__PURE__ */ e("itemscope,allowfullscreen,disablepictureinpicture,disableremoteplayback,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function Se(e) {
	return !!e || e === "";
}
function Ce(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = De(e[i], t[i], n);
	return r;
}
function we(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && De(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function Te(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? we(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = u(e, r), a = u(t, r);
		if (i && !a || !i && a || !De(e[r], t[r], n)) return !1;
	}
	return ke(e) === ke(t);
}
function Ee(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function De(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? Ee(e, t, n, Ce) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : Ee(e, t, n, Te) : String(e) === String(t))));
}
function Oe(e, t) {
	return e.findIndex((e) => De(e, t));
}
function ke(e) {
	return Object.getPrototypeOf(e) === null && e[Symbol.toPrimitive] == null && typeof e.toString != "function" && typeof e.valueOf != "function" ? x(e) : String(e);
}
var Ae = (e) => !!(e && e.__v_isRef === !0), M = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? Ae(e) ? M(e.value) : JSON.stringify(e, je, 2) : String(e), je = (e, t) => Ae(t) ? je(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[Me(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => Me(e)) } : _(t) ? Me(t) : v(t) && !d(t) && !C(t) ? String(t) : t, Me = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e;
// node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
function Ne(e, ...t) {
	console.warn(`[Vue warn] ${e}`, ...t);
}
var Pe, Fe = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && Pe && (Pe.active ? (this.parent = Pe, this.index = (Pe.scopes || (Pe.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].pause();
			}
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].resume();
			}
			let n = this.effects.slice();
			for (e = 0, t = n.length; e < t; e++) n[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			let t = Pe;
			try {
				return Pe = this, e();
			} finally {
				Pe = t;
			}
		} else process.env.NODE_ENV !== "production" && this._warnOnRun && Ne("cannot run an inactive effect scope.");
	}
	on() {
		++this._on === 1 && (this.prevScope = Pe, Pe = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (Pe === this) Pe = this.prevScope;
			else {
				let e = Pe;
				for (; e;) {
					if (e.prevScope === this) {
						e.prevScope = this.prevScope;
						break;
					}
					e = e.prevScope;
				}
			}
			this.prevScope = void 0;
		}
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let t, n;
			for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
			for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
			if (this.cleanups.length = 0, this.scopes) {
				let e = this.scopes.slice();
				for (t = 0, n = e.length; t < n; t++) e[t].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				let e = this.parent.scopes.pop();
				e && e !== this && (this.parent.scopes[this.index] = e, e.index = this.index);
			}
			this.parent = void 0;
		}
	}
};
function Ie() {
	return Pe;
}
var N, Le = /* @__PURE__ */ new WeakSet(), Re = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, Pe && (Pe.active ? Pe.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, Le.has(this) && (Le.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || He(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, tt(this), Ge(this);
		let e = N, t = Ze;
		N = this, Ze = !0;
		try {
			return this.fn();
		} finally {
			process.env.NODE_ENV !== "production" && N !== this && Ne("Active effect was not restored correctly - this is likely a Vue internal bug."), Ke(this), N = e, Ze = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) Ye(e);
			this.deps = this.depsTail = void 0, tt(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? Le.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		qe(this) && this.run();
	}
	get dirty() {
		return qe(this);
	}
}, ze = 0, Be, Ve;
function He(e, t = !1) {
	e.flags |= 8, t ? (e.next = Ve, Ve = e) : (e.next = Be, Be = e);
}
function Ue() {
	ze++;
}
function We() {
	if (--ze > 0) return;
	if (Ve) {
		let e = Ve;
		for (Ve = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; Be;) {
		let t = Be;
		for (Be = void 0; t;) {
			let n = t.next;
			if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
				t.trigger();
			} catch (t) {
				e ||= t;
			}
			t = n;
		}
	}
	if (e) throw e;
}
function Ge(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ke(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), Ye(r), Xe(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function qe(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Je(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Je(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === nt) || (e.globalVersion = nt, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !qe(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = N, r = Ze;
	N = e, Ze = !0;
	try {
		Ge(e);
		let n = e.fn(e._value);
		(t.version === 0 || j(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		N = n, Ze = r, Ke(e), e.flags &= -3;
	}
}
function Ye(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), process.env.NODE_ENV !== "production" && n.subsHead === e && (n.subsHead = i), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) Ye(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function Xe(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var Ze = !0, Qe = [];
function $e() {
	Qe.push(Ze), Ze = !1;
}
function et() {
	let e = Qe.pop();
	Ze = e === void 0 || e;
}
function tt(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = N;
		N = void 0;
		try {
			t();
		} finally {
			N = e;
		}
	}
}
var nt = 0, rt = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, it = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0, process.env.NODE_ENV !== "production" && (this.subsHead = void 0);
	}
	track(e) {
		if (!N || !Ze || N === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== N) t = this.activeLink = new rt(N, this), N.deps ? (t.prevDep = N.depsTail, N.depsTail.nextDep = t, N.depsTail = t) : N.deps = N.depsTail = t, at(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = N.depsTail, t.nextDep = void 0, N.depsTail.nextDep = t, N.depsTail = t, N.deps === t && (N.deps = e);
		}
		return process.env.NODE_ENV !== "production" && N.onTrack && N.onTrack(s({ effect: N }, e)), t;
	}
	trigger(e) {
		this.version++, nt++, this.notify(e);
	}
	notify(e) {
		Ue();
		try {
			if (process.env.NODE_ENV !== "production") for (let t = this.subsHead; t; t = t.nextSub) t.sub.onTrigger && !(t.sub.flags & 8) && t.sub.onTrigger(s({ effect: t.sub }, e));
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			We();
		}
	}
};
function at(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) at(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), process.env.NODE_ENV !== "production" && e.dep.subsHead === void 0 && (e.dep.subsHead = e), e.dep.subs = e;
	}
}
var ot = /* @__PURE__ */ new WeakMap(), st = /* @__PURE__ */ Symbol(process.env.NODE_ENV === "production" ? "" : "Object iterate"), ct = /* @__PURE__ */ Symbol(process.env.NODE_ENV === "production" ? "" : "Map keys iterate"), lt = /* @__PURE__ */ Symbol(process.env.NODE_ENV === "production" ? "" : "Array iterate");
function P(e, t, n) {
	if (Ze && N) {
		let r = ot.get(e);
		r || ot.set(e, r = /* @__PURE__ */ new Map());
		let i = r.get(n);
		i || (r.set(n, i = new it()), i.map = r, i.key = n), process.env.NODE_ENV === "production" ? i.track() : i.track({
			target: e,
			type: t,
			key: n
		});
	}
}
function ut(e, t, n, r, i, a) {
	let o = ot.get(e);
	if (!o) {
		nt++;
		return;
	}
	let s = (o) => {
		o && (process.env.NODE_ENV === "production" ? o.trigger() : o.trigger({
			target: e,
			type: t,
			key: n,
			newValue: r,
			oldValue: i,
			oldTarget: a
		}));
	};
	if (Ue(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && ee(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === lt || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get(lt)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(st)), f(e) && s(o.get(ct)));
				break;
			case "delete":
				i || (s(o.get(st)), f(e) && s(o.get(ct)));
				break;
			case "set": f(e) && s(o.get(st));
		}
	}
	We();
}
function dt(e) {
	let t = /* @__PURE__ */ F(e);
	return t === e || (P(t, "iterate", lt), /* @__PURE__ */ tn(e)) ? t : /* @__PURE__ */ en(e) ? /* @__PURE__ */ $t(e) ? t.map((e) => on(an(e))) : t.map(on) : t.map(an);
}
function ft(e) {
	return P(e = /* @__PURE__ */ F(e), "iterate", lt), e;
}
function pt(e, t) {
	return /* @__PURE__ */ en(e) ? on(/* @__PURE__ */ $t(e) ? an(t) : t) : an(t);
}
var mt = {
	__proto__: null,
	[Symbol.iterator]() {
		return ht(this, Symbol.iterator, (e) => pt(this, e));
	},
	concat(...e) {
		return dt(this).concat(...e.map((e) => d(e) ? dt(e) : e));
	},
	entries() {
		return ht(this, "entries", (e) => (e[1] = pt(this, e[1]), e));
	},
	every(e, t) {
		return vt(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return vt(this, "filter", e, t, (e) => e.map((e) => pt(this, e)), arguments);
	},
	find(e, t) {
		return vt(this, "find", e, t, (e) => pt(this, e), arguments);
	},
	findIndex(e, t) {
		return vt(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return vt(this, "findLast", e, t, (e) => pt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return vt(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return vt(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return bt(this, "includes", e);
	},
	indexOf(...e) {
		return bt(this, "indexOf", e);
	},
	join(e) {
		return dt(this).join(e);
	},
	lastIndexOf(...e) {
		return bt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return vt(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return xt(this, "pop");
	},
	push(...e) {
		return xt(this, "push", e);
	},
	reduce(e, ...t) {
		return yt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return yt(this, "reduceRight", e, t);
	},
	shift() {
		return xt(this, "shift");
	},
	some(e, t) {
		return vt(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return xt(this, "splice", e);
	},
	toReversed() {
		return dt(this).toReversed();
	},
	toSorted(e) {
		return dt(this).toSorted(e);
	},
	toSpliced(...e) {
		return dt(this).toSpliced(...e);
	},
	unshift(...e) {
		return xt(this, "unshift", e);
	},
	values() {
		return ht(this, "values", (e) => pt(this, e));
	}
};
function ht(e, t, n) {
	let r = ft(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ tn(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => gt(a.next(), n), i !== _t[t] && Object.defineProperties(e, {
				return: { get() {
					let e = a.return;
					return typeof e == "function" ? e.bind(a) : e;
				} },
				throw: { get() {
					let e = a.throw;
					return typeof e == "function" ? e.bind(a) : e;
				} }
			}), e;
		}
		a._next = a.next, a.next = () => gt(a._next(), n);
	}
	return a;
}
function gt(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var _t = Array.prototype;
function vt(e, t, n, r, i, a) {
	let o = ft(e), s = o !== e && !/* @__PURE__ */ tn(e), c = o[t];
	if (c !== _t[t]) {
		let t = c.apply(e, a);
		return s ? an(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, pt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function yt(e, t, n, r) {
	let i = ft(e), a = i !== e && !/* @__PURE__ */ tn(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = pt(e, t)), n.call(this, t, pt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? pt(e, c) : c;
}
function bt(e, t, n) {
	let r = /* @__PURE__ */ F(e);
	P(r, "iterate", lt);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ nn(n[0]) ? (n[0] = /* @__PURE__ */ F(n[0]), r[t](...n)) : i;
}
function xt(e, t, n = []) {
	$e(), Ue();
	let r = (/* @__PURE__ */ F(e))[t].apply(e, n);
	return We(), et(), r;
}
var St = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), Ct = /* @__PURE__ */ new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function wt(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ F(this);
	return P(t, "has", e), t.hasOwnProperty(e);
}
var Tt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? Kt : Gt : i ? Wt : Ut).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = mt[t])) return e;
			if (t === "hasOwnProperty") return wt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ I(e) ? e : n);
		if ((_(t) ? Ct.has(t) : St(t)) || (r || P(e, "get", t), i)) return o;
		if (/* @__PURE__ */ I(o)) {
			let e = a && ee(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ Xt(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ Xt(o) : /* @__PURE__ */ Jt(o) : o;
	}
}, Et = class extends Tt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && ee(t);
		if (!this._isShallow) {
			let r = /* @__PURE__ */ en(i);
			if (!/* @__PURE__ */ tn(n) && !/* @__PURE__ */ en(n) && (i = /* @__PURE__ */ F(i), n = /* @__PURE__ */ F(n)), !a && /* @__PURE__ */ I(i) && !/* @__PURE__ */ I(n)) return r ? (process.env.NODE_ENV !== "production" && Ne(`Set operation on key "${String(t)}" failed: target is readonly.`, e[t]), !0) : (i.value = n, !0);
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ I(e) ? e : r);
		return e === /* @__PURE__ */ F(r) && s && (o ? j(n, i) && ut(e, "set", t, n, i) : ut(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && ut(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return _(t) && Ct.has(t) || P(e, "has", t), n;
	}
	ownKeys(e) {
		return P(e, "iterate", d(e) ? "length" : st), Reflect.ownKeys(e);
	}
}, Dt = class extends Tt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return process.env.NODE_ENV !== "production" && Ne(`Set operation on key "${String(t)}" failed: target is readonly.`, e), !0;
	}
	deleteProperty(e, t) {
		return process.env.NODE_ENV !== "production" && Ne(`Delete operation on key "${String(t)}" failed: target is readonly.`, e), !0;
	}
}, Ot = /* @__PURE__ */ new Et(), kt = /* @__PURE__ */ new Dt(), At = /* @__PURE__ */ new Et(!0), jt = /* @__PURE__ */ new Dt(!0), Mt = (e) => e, Nt = (e) => Reflect.getPrototypeOf(e);
function Pt(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ F(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? Mt : t ? on : an;
		return !t && P(a, "iterate", l ? ct : st), s(Object.create(u), { next() {
			let { value: e, done: t } = u.next();
			return t ? {
				value: e,
				done: t
			} : {
				value: c ? [d(e[0]), d(e[1])] : d(e),
				done: t
			};
		} });
	};
}
function Ft(e) {
	return function(...t) {
		if (process.env.NODE_ENV !== "production") {
			let n = t[0] ? `on key "${t[0]}" ` : "";
			Ne(`${re(e)} operation ${n}failed: target is readonly.`, /* @__PURE__ */ F(this));
		}
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function It(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ F(r), a = /* @__PURE__ */ F(n);
			e || (j(n, a) && P(i, "get", n), P(i, "get", a));
			let { has: o } = Nt(i), s = t ? Mt : e ? on : an;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && P(/* @__PURE__ */ F(t), "iterate", st), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ F(n), i = /* @__PURE__ */ F(t);
			return e || (j(t, i) && P(r, "has", t), P(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ F(a), s = t ? Mt : e ? on : an;
			return !e && P(o, "iterate", st), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: Ft("add"),
		set: Ft("set"),
		delete: Ft("delete"),
		clear: Ft("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ F(this), r = Nt(n), i = /* @__PURE__ */ F(e), a = !t && !/* @__PURE__ */ tn(e) && !/* @__PURE__ */ en(e) ? i : e;
			return r.has.call(n, a) || j(e, a) && r.has.call(n, e) || j(i, a) && r.has.call(n, i) || (n.add(a), ut(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ tn(n) || /* @__PURE__ */ en(n) || (n = /* @__PURE__ */ F(n));
			let r = /* @__PURE__ */ F(this), { has: i, get: a } = Nt(r), o = i.call(r, e);
			o ? process.env.NODE_ENV !== "production" && Ht(r, i, e) : (e = /* @__PURE__ */ F(e), o = i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? j(n, s) && ut(r, "set", e, n, s) : ut(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ F(this), { has: n, get: r } = Nt(t), i = n.call(t, e);
			i ? process.env.NODE_ENV !== "production" && Ht(t, n, e) : (e = /* @__PURE__ */ F(e), i = n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && ut(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ F(this), t = e.size !== 0, n = process.env.NODE_ENV === "production" ? void 0 : f(e) ? new Map(e) : new Set(e), r = e.clear();
			return t && ut(e, "clear", void 0, void 0, n), r;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Pt(r, e, t);
	}), n;
}
function Lt(e, t) {
	let n = It(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(u(n, i) && i in r ? n : r, i, a);
}
var Rt = { get: /* @__PURE__ */ Lt(!1, !1) }, zt = { get: /* @__PURE__ */ Lt(!1, !0) }, Bt = { get: /* @__PURE__ */ Lt(!0, !1) }, Vt = { get: /* @__PURE__ */ Lt(!0, !0) };
function Ht(e, t, n) {
	let r = /* @__PURE__ */ F(n);
	if (r !== n && t.call(e, r)) {
		let t = S(e);
		Ne(`Reactive ${t} contains both the raw and reactive versions of the same object${t === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
	}
}
var Ut = /* @__PURE__ */ new WeakMap(), Wt = /* @__PURE__ */ new WeakMap(), Gt = /* @__PURE__ */ new WeakMap(), Kt = /* @__PURE__ */ new WeakMap();
function qt(e) {
	switch (e) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
// @__NO_SIDE_EFFECTS__
function Jt(e) {
	return /* @__PURE__ */ en(e) ? e : Qt(e, !1, Ot, Rt, Ut);
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
	return Qt(e, !1, At, zt, Wt);
}
// @__NO_SIDE_EFFECTS__
function Xt(e) {
	return Qt(e, !0, kt, Bt, Gt);
}
// @__NO_SIDE_EFFECTS__
function Zt(e) {
	return Qt(e, !0, jt, Vt, Kt);
}
function Qt(e, t, n, r, i) {
	if (!v(e)) return process.env.NODE_ENV !== "production" && Ne(`value cannot be made ${t ? "readonly" : "reactive"}: ${String(e)}`), e;
	if (e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = qt(S(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function $t(e) {
	return /* @__PURE__ */ en(e) ? /* @__PURE__ */ $t(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function en(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function tn(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function nn(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function F(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ F(t) : e;
}
function rn(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && ae(e, "__v_skip", !0), e;
}
var an = (e) => v(e) ? /* @__PURE__ */ Jt(e) : e, on = (e) => v(e) ? /* @__PURE__ */ Xt(e) : e;
// @__NO_SIDE_EFFECTS__
function I(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function L(e) {
	return cn(e, !1);
}
// @__NO_SIDE_EFFECTS__
function sn(e) {
	return cn(e, !0);
}
function cn(e, t) {
	return /* @__PURE__ */ I(e) ? e : new ln(e, t);
}
var ln = class {
	constructor(e, t) {
		this.dep = new it(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ F(e), this._value = t ? e : an(e), this.__v_isShallow = t;
	}
	get value() {
		return process.env.NODE_ENV === "production" ? this.dep.track() : this.dep.track({
			target: this,
			type: "get",
			key: "value"
		}), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ tn(e) || /* @__PURE__ */ en(e);
		e = n ? e : /* @__PURE__ */ F(e), j(e, t) && (this._rawValue = e, this._value = n ? e : an(e), process.env.NODE_ENV === "production" ? this.dep.trigger() : this.dep.trigger({
			target: this,
			type: "set",
			key: "value",
			newValue: e,
			oldValue: t
		}));
	}
};
function un(e) {
	e.dep && (process.env.NODE_ENV === "production" ? e.dep.trigger() : e.dep.trigger({
		target: e,
		type: "set",
		key: "value",
		newValue: e._value
	}));
}
function R(e) {
	return /* @__PURE__ */ I(e) ? e.value : e;
}
var dn = {
	get: (e, t, n) => t === "__v_raw" ? e : R(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ I(i) && !/* @__PURE__ */ I(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function fn(e) {
	return /* @__PURE__ */ $t(e) ? e : new Proxy(e, dn);
}
var pn = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new it(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function mn(e) {
	return new pn(e);
}
var hn = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new it(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = nt - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && N !== this) return He(this, !0), !0;
		process.env.NODE_ENV;
	}
	get value() {
		let e = process.env.NODE_ENV === "production" ? this.dep.track() : this.dep.track({
			target: this,
			type: "get",
			key: "value"
		});
		return Je(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter ? this.setter(e) : process.env.NODE_ENV !== "production" && Ne("Write operation failed: computed value is readonly");
	}
};
// @__NO_SIDE_EFFECTS__
function gn(e, t, n = !1) {
	let r, i;
	h(e) ? r = e : (r = e.get, i = e.set);
	let a = new hn(r, i, n);
	return process.env.NODE_ENV !== "production" && t && !n && (a.onTrack = t.onTrack, a.onTrigger = t.onTrigger), a;
}
var _n = {}, vn = /* @__PURE__ */ new WeakMap(), yn = void 0;
function bn(e, t = !1, n = yn) {
	if (n) {
		let t = vn.get(n);
		t || vn.set(n, t = []), t.push(e);
	} else process.env.NODE_ENV !== "production" && !t && Ne("onWatcherCleanup() was called when there was no active watcher to associate with.");
}
function xn(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => {
		(i.onWarn || Ne)("Invalid watch source: ", e, "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.");
	}, m = (e) => o ? e : /* @__PURE__ */ tn(e) || o === !1 || o === 0 ? Sn(e, 1) : Sn(e), g, _, v, y, b = !1, x = !1;
	if (/* @__PURE__ */ I(e) ? (_ = () => e.value, b = /* @__PURE__ */ tn(e)) : /* @__PURE__ */ $t(e) ? (_ = () => m(e), b = !0) : d(e) ? (x = !0, b = e.some((e) => /* @__PURE__ */ $t(e) || /* @__PURE__ */ tn(e)), _ = () => e.map((e) => {
		if (/* @__PURE__ */ I(e)) return e.value;
		if (/* @__PURE__ */ $t(e)) return m(e);
		if (h(e)) return f ? f(e, 2) : e();
		process.env.NODE_ENV !== "production" && p(e);
	})) : h(e) ? _ = n ? f ? () => f(e, 2) : e : () => {
		if (v) {
			$e();
			try {
				v();
			} finally {
				et();
			}
		}
		let t = yn;
		yn = g;
		try {
			return f ? f(e, 3, [y]) : e(y);
		} finally {
			yn = t;
		}
	} : (_ = r, process.env.NODE_ENV !== "production" && p(e)), n && o) {
		let e = _, t = o === !0 ? Infinity : o;
		_ = () => Sn(e(), t);
	}
	let S = Ie(), C = () => {
		g.stop(), S && S.active && c(S.effects, g);
	};
	if (s && n) {
		let e = n;
		n = (...t) => {
			try {
				return e(...t);
			} finally {
				C();
			}
		};
	}
	let ee = x ? Array(e.length).fill(_n) : _n, w = (e) => {
		if (g.flags & 1 && (g.dirty || e)) {
			if (n) {
				let t = g.run();
				if (e || o || b || (x ? t.some((e, t) => j(e, ee[t])) : j(t, ee))) {
					let e = yn;
					$e();
					try {
						v && v(), yn = g;
						let e = [
							t,
							ee === _n ? void 0 : x && ee[0] === _n ? [] : ee,
							y
						];
						ee = t, f ? f(n, 3, e) : n(...e);
					} finally {
						yn = e, et();
					}
				}
			} else g.run();
		}
	};
	return u && u(w), g = new Re(_), g.scheduler = l ? () => l(w, !1) : w, y = (e) => bn(e, !1, g), v = g.onStop = () => {
		let e = vn.get(g);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			vn.delete(g);
		}
	}, process.env.NODE_ENV !== "production" && (g.onTrack = i.onTrack, g.onTrigger = i.onTrigger), n ? a ? w(!0) : ee = g.run() : l ? l(w.bind(null, !0), !0) : g.run(), C.pause = g.pause.bind(g), C.resume = g.resume.bind(g), C.stop = C, C;
}
function Sn(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ I(e)) Sn(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) Sn(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		Sn(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) Sn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && Sn(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
var Cn = [];
function wn(e) {
	Cn.push(e);
}
function Tn() {
	Cn.pop();
}
var En = !1;
function z(e, ...t) {
	if (En) return;
	En = !0, $e();
	let n = Cn.length ? Cn[Cn.length - 1].component : null, r = n && n.appContext.config.warnHandler, i = Dn();
	if (r) Nn(r, n, 11, [
		e + t.map((e) => e.toString?.call(e) ?? JSON.stringify(e)).join(""),
		n && n.proxy,
		i.map(({ vnode: e }) => `at <${_s(n, e.type)}>`).join("\n"),
		i
	]);
	else {
		let n = [`[Vue warn]: ${e}`, ...t];
		i.length && n.push("\n", ...On(i)), console.warn(...n);
	}
	et(), En = !1;
}
function Dn() {
	let e = Cn[Cn.length - 1];
	if (!e) return [];
	let t = [];
	for (; e;) {
		let n = t[0];
		n && n.vnode === e ? n.recurseCount++ : t.push({
			vnode: e,
			recurseCount: 0
		});
		let r = e.component && e.component.parent;
		e = r && r.vnode;
	}
	return t;
}
function On(e) {
	let t = [];
	return e.forEach((e, n) => {
		t.push(...n === 0 ? [] : ["\n"], ...kn(e));
	}), t;
}
function kn({ vnode: e, recurseCount: t }) {
	let n = t > 0 ? `... (${t} recursive calls)` : "", r = e.component ? e.component.parent == null : !1, i = ` at <${_s(e.component, e.type, r)}`, a = ">" + n;
	return e.props ? [
		i,
		...An(e.props),
		a
	] : [i + a];
}
function An(e) {
	let t = [], n = Object.keys(e);
	return n.slice(0, 3).forEach((n) => {
		t.push(...jn(n, e[n]));
	}), n.length > 3 && t.push(" ..."), t;
}
function jn(e, t, n) {
	return g(t) ? (t = JSON.stringify(t), n ? t : [`${e}=${t}`]) : typeof t == "number" || typeof t == "boolean" || t == null ? n ? t : [`${e}=${t}`] : /* @__PURE__ */ I(t) ? (t = jn(e, /* @__PURE__ */ F(t.value), !0), n ? t : [
		`${e}=Ref<`,
		t,
		">"
	]) : h(t) ? [`${e}=fn${t.name ? `<${t.name}>` : ""}`] : (t = /* @__PURE__ */ F(t), n ? t : [`${e}=`, t]);
}
var Mn = {
	sp: "serverPrefetch hook",
	bc: "beforeCreate hook",
	c: "created hook",
	bm: "beforeMount hook",
	m: "mounted hook",
	bu: "beforeUpdate hook",
	u: "updated",
	bum: "beforeUnmount hook",
	um: "unmounted hook",
	a: "activated hook",
	da: "deactivated hook",
	ec: "errorCaptured hook",
	rtc: "renderTracked hook",
	rtg: "renderTriggered hook",
	0: "setup function",
	1: "render function",
	2: "watcher getter",
	3: "watcher callback",
	4: "watcher cleanup function",
	5: "native event handler",
	6: "component event handler",
	7: "vnode hook",
	8: "directive hook",
	9: "transition hook",
	10: "app errorHandler",
	11: "app warnHandler",
	12: "ref function",
	13: "async component loader",
	14: "scheduler flush",
	15: "component update",
	16: "app unmount cleanup function"
};
function Nn(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		Fn(e, t, n);
	}
}
function Pn(e, t, n, r) {
	if (h(e)) {
		let i = Nn(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			Fn(e, t, n, void 0, !0);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(Pn(e[a], t, n, r));
		return i;
	}
	process.env.NODE_ENV !== "production" && z(`Invalid value type passed to callWithAsyncErrorHandling(): ${typeof e}`);
}
function Fn(e, n, r, i = !0, a = !1) {
	let o = n ? n.vnode : null, { errorHandler: s, throwUnhandledErrorInProduction: c } = n && n.appContext.config || t;
	if (n) {
		let t = n.parent, i = n.proxy, o = process.env.NODE_ENV === "production" ? `https://vuejs.org/error-reference/#runtime-${r}` : Mn[r];
		for (; t;) {
			let n = t.ec;
			if (n && !t.isUnmounted && (!a || t.scope.active)) {
				for (let t = 0; t < n.length; t++) if (n[t](e, i, o) === !1) return;
			}
			t = t.parent;
		}
		if (s) {
			$e(), Nn(s, null, 10, [
				e,
				i,
				o
			]), et();
			return;
		}
	}
	In(e, r, o, i, c);
}
function In(e, t, n, r = !0, i = !1) {
	if (process.env.NODE_ENV !== "production") {
		let i = Mn[t];
		if (n && wn(n), z(`Unhandled error${i ? ` during execution of ${i}` : ""}`), n && Tn(), r) throw e;
		console.error(e);
	} else if (i) throw e;
	else console.error(e);
}
var Ln = [], Rn = -1, zn = [], Bn = null, Vn = 0, Hn = /* @__PURE__ */ Promise.resolve(), Un = null, Wn = 100;
function Gn(e) {
	let t = Un || Hn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function Kn(e) {
	let t = Rn + 1, n = Ln.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = Ln[r], a = er(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function qn(e) {
	if (!(e.flags & 1)) {
		let t = er(e), n = Ln[Ln.length - 1];
		!n || !(e.flags & 2) && t >= er(n) ? Ln.push(e) : Ln.splice(Kn(t), 0, e), e.flags |= 1, Jn();
	}
}
function Jn() {
	Un ||= Hn.then(tr);
}
function Yn(e) {
	if (!d(e)) Bn && e.id === -1 ? Bn.splice(Vn + 1, 0, e) : e.flags & 1 || (zn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) zn.push(e[t]);
	Jn();
}
function Xn(e, t, n, r = Rn + 1) {
	for (process.env.NODE_ENV !== "production" && (n ||= /* @__PURE__ */ new Map()); r < Ln.length; r++) {
		let i = Ln[r];
		if (i && i.flags & 2) {
			if (e && i.id !== e.uid || t !== void 0 && !(i.id >= t) || process.env.NODE_ENV !== "production" && nr(n, i)) continue;
			Ln.splice(r, 1), r = e ? r - 1 : Rn, i.flags & 4 && (i.flags &= -2), i(), i.flags & 4 || (i.flags &= -2);
		}
	}
}
function Zn(e, t, n = 0) {
	if (zn.length) {
		let r = zn, i = 0;
		if (t) {
			r = [];
			for (let e = 0; e < zn.length; e++) {
				let a = zn[e];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? zn[i++] = a : r.push(a);
			}
		}
		let a = [...new Set(r)].sort((e, t) => er(e) - er(t));
		if (zn.length = i, Bn) {
			for (let e = 0; e < a.length; e++) Bn.push(a[e]);
			return;
		}
		for (Bn = a, process.env.NODE_ENV !== "production" && (e ||= /* @__PURE__ */ new Map()), Vn = 0; Vn < Bn.length; Vn++) {
			let t = Bn[Vn];
			process.env.NODE_ENV !== "production" && nr(e, t) || (t.flags & 4 && (t.flags &= -2), t.flags & 8 || t(), t.flags &= -2);
		}
		Bn = null, Vn = 0;
	}
}
var Qn = !1;
function $n(e, t) {
	if (Qn) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(zn);
	e(), Qn = !0;
	try {
		Xn(void 0, t), Zn(void 0, n, t);
	} finally {
		Qn = !1;
	}
}
var er = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function tr(e) {
	process.env.NODE_ENV !== "production" && (e ||= /* @__PURE__ */ new Map());
	let t = process.env.NODE_ENV === "production" ? r : (t) => nr(e, t);
	try {
		for (Rn = 0; Rn < Ln.length; Rn++) {
			let e = Ln[Rn];
			if (e && !(e.flags & 8)) {
				if (process.env.NODE_ENV !== "production" && t(e)) continue;
				e.flags & 4 && (e.flags &= -2), Nn(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2);
			}
		}
	} finally {
		for (; Rn < Ln.length; Rn++) {
			let e = Ln[Rn];
			e && (e.flags &= -2);
		}
		Rn = -1, Ln.length = 0, Zn(e), Un = null, (Ln.length || zn.length) && tr(e);
	}
}
function nr(e, t) {
	let n = e.get(t) || 0;
	if (n > Wn) {
		let e = t.i, n = e && gs(e.type);
		return Fn(`Maximum recursive updates exceeded${n ? ` in component <${n}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`, null, 10), !0;
	}
	return e.set(t, n + 1), !1;
}
var rr = !1, ir = (e) => {
	try {
		return rr;
	} finally {
		rr = e;
	}
}, ar = /* @__PURE__ */ new Map();
process.env.NODE_ENV !== "production" && (ce().__VUE_HMR_RUNTIME__ = {
	createRecord: mr(lr),
	rerender: mr(dr),
	reload: mr(fr)
});
var or = /* @__PURE__ */ new Map();
function sr(e) {
	let t = e.type.__hmrId, n = or.get(t);
	n ||= (lr(t, e.type), or.get(t)), n.instances.add(e);
}
function cr(e) {
	or.get(e.type.__hmrId).instances.delete(e);
}
function lr(e, t) {
	return !or.has(e) && (or.set(e, {
		initialDef: ur(t),
		instances: /* @__PURE__ */ new Set()
	}), !0);
}
function ur(e) {
	return vs(e) ? e.__vccOpts : e;
}
function dr(e, t) {
	let n = or.get(e);
	n && (n.initialDef.render = t, [...n.instances].forEach((e) => {
		t && (e.render = t, ur(e.type).render = t), e.renderCache = [], rr = !0, e.job.flags & 8 || e.update(), rr = !1;
	}));
}
function fr(e, t) {
	let n = or.get(e);
	if (!n) return;
	t = ur(t), pr(n.initialDef, t);
	let i = [...n.instances];
	for (let e = 0; e < i.length; e++) {
		let a = i[e], o = ur(a.type), s = ar.get(o);
		if (s || (o !== n.initialDef && pr(o, t), ar.set(o, s = /* @__PURE__ */ new Set())), s.add(a), a.appContext.propsCache.delete(a.type), a.appContext.emitsCache.delete(a.type), a.appContext.optionsCache.delete(a.type), a.ceReload) s.add(a), a.ceReload(t.styles), s.delete(a);
		else if (a.parent) {
			let e = () => {
				if (!a.scope.active) return;
				let t = a.asyncDep && !a.asyncResolved ? a : mo(a.parent);
				if (t) t.asyncDep.catch(r).then(() => {
					a.scope.active && (t.asyncResolved || !t.scope.active) && qn(e);
				});
				else {
					s = ar.get(o), s || ar.set(o, s = /* @__PURE__ */ new Set()), s.add(a), rr = !0;
					try {
						a.parent.update();
					} finally {
						rr = !1, s.delete(a), Yn(() => ar.clear());
					}
				}
			};
			qn(e);
		} else a.appContext.reload ? a.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn("[HMR] Root or manually mounted instance modified. Full reload required.");
		a.root.ce && a !== a.root && a.root.ce._removeChildStyle(o);
	}
	Yn(() => {
		ar.clear();
	});
}
function pr(e, t) {
	s(e, t);
	for (let n in e) n !== "__file" && !(n in t) && delete e[n];
}
function mr(e) {
	return (t, n) => {
		try {
			return e(t, n);
		} catch (e) {
			console.error(e), console.warn("[HMR] Something went wrong during Vue component hot-reload. Full reload required.");
		}
	};
}
var hr, gr = [], _r = !1;
function vr(e, ...t) {
	hr ? hr.emit(e, ...t) : _r || gr.push({
		event: e,
		args: t
	});
}
function yr(e, t) {
	hr = e, hr ? (hr.enabled = !0, gr.forEach(({ event: e, args: t }) => hr.emit(e, ...t)), gr = []) : typeof window < "u" && window.HTMLElement && !(window.navigator?.userAgent)?.includes("jsdom") ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((e) => {
		yr(e, t);
	}), setTimeout(() => {
		hr || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, _r = !0, gr = []);
	}, 3e3)) : (_r = !0, gr = []);
}
function br(e, t) {
	vr("app:init", e, t, {
		Fragment: H,
		Text: bo,
		Comment: xo,
		Static: So
	});
}
function xr(e) {
	vr("app:unmount", e);
}
var Sr = /* @__PURE__ */ Er("component:added"), Cr = /* @__PURE__ */ Er("component:updated"), wr = /* @__PURE__ */ Er("component:removed"), Tr = (e) => {
	hr && typeof hr.cleanupBuffer == "function" && !hr.cleanupBuffer(e) && wr(e);
};
// @__NO_SIDE_EFFECTS__
function Er(e) {
	return (t) => {
		vr(e, t.appContext.app, t.uid, t.parent ? t.parent.uid : void 0, t);
	};
}
var Dr = /* @__PURE__ */ kr("perf:start"), Or = /* @__PURE__ */ kr("perf:end");
function kr(e) {
	return (t, n, r) => {
		vr(e, t.appContext.app, t.uid, t, n, r);
	};
}
function Ar(e, t, n) {
	vr("component:emit", e.appContext.app, e, t, n);
}
var jr = null, Mr = null;
function Nr(e) {
	let t = jr;
	return jr = e, Mr = e && e.type.__scopeId || null, t;
}
function Pr(e, t = jr, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Do(-1);
		let i = Nr(t), a = Co.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Co.length; e > a; e--) To();
			Nr(i), r._d && Do(1);
		}
		return process.env.NODE_ENV !== "production" && Cr(t), o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function Fr(e) {
	te(e) && z("Do not use built-in directive ids as custom directive id: " + e);
}
function B(e, n) {
	if (jr === null) return process.env.NODE_ENV !== "production" && z("withDirectives can only be used inside render functions."), e;
	let r = ps(jr), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && Sn(o), i.push({
			dir: a,
			instance: r,
			value: o,
			oldValue: void 0,
			arg: s,
			modifiers: c
		}));
	}
	return e;
}
function Ir(e, t, n, r) {
	let i = e;
	if (r === "beforeMount") e._mount = e;
	else if (r === "beforeUpdate") {
		let n = t && t._mount;
		n && (n._latest = e, e._mount = n);
	} else if (r === "mounted") {
		let t = e._latest;
		e._mount = e._latest = void 0, t && (i = t, t._mount = void 0);
	}
	let a = i.dirs, o = t && t.dirs;
	for (let c = 0; c < a.length; c++) {
		let l = a[c];
		o ? l.oldValue = o[c].value : r === "mounted" && l.oldValue !== void 0 && (l = s({}, l, { oldValue: void 0 }));
		let u = l.dir[r];
		u && ($e(), Pn(u, n, 8, [
			e.el,
			l,
			i,
			t
		]), et());
	}
}
function Lr(e, t) {
	if (process.env.NODE_ENV !== "production" && (!Y || Y.isMounted) && z("provide() can only be used inside setup()."), Y) {
		let n = Y.provides, r = Y.parent && Y.parent.provides;
		r === n && (n = Y.provides = Object.create(r)), n[e] = t;
	}
}
function Rr(e, t, n = !1) {
	let r = Yo();
	if (r || oa) {
		let i = oa ? oa._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
		process.env.NODE_ENV !== "production" && z(`injection "${String(e)}" not found.`);
	} else process.env.NODE_ENV !== "production" && z("inject() can only be used inside setup() or functional components.");
}
var zr = /* @__PURE__ */ Symbol.for("v-scx"), Br = () => {
	{
		let e = Rr(zr);
		return e || process.env.NODE_ENV !== "production" && z("Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."), e;
	}
};
function Vr(e, t) {
	return Ur(e, null, process.env.NODE_ENV === "production" ? { flush: "sync" } : s({}, t, { flush: "sync" }));
}
function Hr(e, t, n) {
	return process.env.NODE_ENV !== "production" && !h(t) && z("`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."), Ur(e, t, n);
}
function Ur(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i;
	process.env.NODE_ENV !== "production" && !n && (a !== void 0 && z("watch() \"immediate\" option is only respected when using the watch(source, callback, options?) signature."), o !== void 0 && z("watch() \"deep\" option is only respected when using the watch(source, callback, options?) signature."), l !== void 0 && z("watch() \"once\" option is only respected when using the watch(source, callback, options?) signature."));
	let u = s({}, i);
	process.env.NODE_ENV !== "production" && (u.onWarn = z);
	let d = n && a || !n && c !== "post", f;
	if (rs) {
		if (c === "sync") {
			let e = Br();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = Y;
	u.call = (e, t, n) => Pn(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, ao(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : qn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = xn(e, n, u);
	return rs && (f ? f.push(h) : d && h()), h;
}
function Wr(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Gr(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = Qo(this), s = Ur(i, a.bind(r), n);
	return o(), s;
}
function Gr(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Kr = /* @__PURE__ */ Symbol("_vte"), qr = (e) => e.__isTeleport, Jr = /* @__PURE__ */ Symbol("_leaveCb");
function Yr(e) {
	let t = e[0];
	if (e.length > 1) {
		let n = !1;
		for (let r of e) if (r.type !== xo) {
			if (process.env.NODE_ENV !== "production" && n) {
				z("<transition> can only be used on a single element or component. Use <transition-group> for lists.");
				break;
			}
			if (t = r, n = !0, process.env.NODE_ENV === "production") break;
		}
	}
	return t;
}
function Xr(e) {
	if (!si(e)) return qr(e.type) && e.children ? Yr(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function Zr(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		Zr(qr(n.type) && Xr(n) || n, t);
	} else if (e.shapeFlag & 128) {
		let n = e.suspense;
		if (n) {
			let e = n.isHydrating ? n.pendingBranch : n.activeBranch;
			e && Zr(e, t.clone(e));
		} else e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	} else if (e.transition = t, e.type === H && d(e.children)) {
		let n = _a(e.children, !1);
		n && Zr(n, t);
	}
}
function Qr(e) {
	if (e.component) return Qr(e.component.subTree);
	if (e.type === H) {
		let t = d(e.children) && _a(e.children, !1);
		return t ? Qr(t) : void 0;
	}
	if (e.type !== xo) return e;
}
// @__NO_SIDE_EFFECTS__
function $r(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function ei(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
var ti = /* @__PURE__ */ new WeakSet();
function ni(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var ri = /* @__PURE__ */ new WeakMap();
function ii(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => ii(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (oi(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && ii(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? ps(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e;
	if (process.env.NODE_ENV !== "production" && !f) {
		z("Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function.");
		return;
	}
	let m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ F(v), b = v === t ? i : (e) => process.env.NODE_ENV !== "production" && (u(y, e) && !/* @__PURE__ */ I(y[e]) && z(`Template ref "${e}" used on a non-ref value. It will not work in the production build.`), ti.has(y[e])) || ni(_, e) ? !1 : u(y, e), x = (e, t) => !(process.env.NODE_ENV !== "production" && ti.has(e) || t && ni(_, t));
	if (m != null && m !== p) {
		if (ai(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ I(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) Nn(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ I(p);
		if (t || n) {
			let i = () => {
				if (e.f) {
					let n = t ? b(p) ? v[p] : _[p] : x(p) || !e.k ? p.value : _[e.k];
					if (o) d(n) && c(n, s);
					else if (d(n)) n.includes(s) || n.push(s);
					else if (t) _[p] = [s], b(p) && (v[p] = _[p]);
					else {
						let t = [s];
						x(p, e.k) && (p.value = t), e.k && (_[e.k] = t);
					}
				} else t ? (_[p] = l, b(p) && (v[p] = l)) : n ? (x(p, e.k) && (p.value = l), e.k && (_[e.k] = l)) : process.env.NODE_ENV !== "production" && z("Invalid template ref type:", p, `(${typeof p})`);
			};
			if (l) {
				let t = () => {
					i(), ri.delete(e);
				};
				t.id = -1, ri.set(e, t), ao(t, r);
			} else ai(e), i();
		} else process.env.NODE_ENV !== "production" && z("Invalid template ref type:", p, `(${typeof p})`);
	}
}
function ai(e) {
	let t = ri.get(e);
	t && (t.flags |= 8, ri.delete(e));
}
ce().requestIdleCallback, ce().cancelIdleCallback;
var oi = (e) => !!e.type.__asyncLoader, si = (e) => e.type.__isKeepAlive;
function ci(e, t) {
	ui(e, "a", t);
}
function li(e, t) {
	ui(e, "da", t);
}
function ui(e, t, n = Y) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (fi(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) si(e.parent.vnode) && di(r, t, n, e), e = e.parent;
	}
}
function di(e, t, n, r) {
	let i = fi(t, e, r, !0), a = fi("um", () => c(r[t], i), n);
	a.flags = 16;
}
function fi(e, t, n = Y, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			$e();
			let i = Qo(n), a = Pn(t, n, e, r);
			return i(), et(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
	process.env.NODE_ENV !== "production" && z(`${A(Mn[e].replace(/ hook$/, ""))} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`);
}
var pi = (e) => (t, n = Y) => {
	rs && e !== "sp" || fi(e, (...e) => t(...e), n);
}, mi = pi("bm"), hi = pi("m"), gi = pi("bu"), _i = pi("u"), vi = pi("bum"), yi = pi("um"), bi = pi("sp"), xi = pi("rtg"), Si = pi("rtc");
function Ci(e, t = Y) {
	fi("ec", e, t);
}
var wi = "components", Ti = /* @__PURE__ */ Symbol.for("v-ndc");
function Ei(e) {
	return g(e) ? Di(wi, e, !1) || e : e || Ti;
}
function Di(e, t, n = !0, r = !1) {
	let i = jr || Y;
	if (i) {
		let a = i.type;
		if (e === wi) {
			let e = gs(a, !1);
			if (e && (e === t || e === D(t) || e === re(D(t)))) return a;
		}
		let o = Oi(i[e] || a[e], t) || Oi(i.appContext[e], t);
		if (!o && r) return a;
		if (process.env.NODE_ENV !== "production" && n && !o) {
			let n = e === wi ? "\nIf this is a native custom element, make sure to exclude it from component resolution via compilerOptions.isCustomElement." : "";
			z(`Failed to resolve ${e.slice(0, -1)}: ${t}${n}`);
		}
		return o;
	}
	process.env.NODE_ENV !== "production" && z(`resolve${re(e.slice(0, -1))} can only be used in render() or setup().`);
}
function Oi(e, t) {
	return e && (e[t] || e[D(t)] || e[re(D(t))]);
}
function V(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ $t(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ tn(e), s = /* @__PURE__ */ en(e), e = ft(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? on(an(e[n])) : an(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) process.env.NODE_ENV !== "production" && z(`The v-for range expects a positive integer value but got ${e}.`), i = [];
		else {
			i = Array(e);
			for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
		}
	} else if (v(e)) {
		if (e[Symbol.iterator]) i = Array.from(e, (e, n) => t(e, n, void 0, a && a[n]));
		else {
			let n = Object.keys(e);
			i = Array(n.length);
			for (let r = 0, o = n.length; r < o; r++) {
				let o = n[r];
				i[r] = t(e[o], o, r, a && a[r]);
			}
		}
	} else i = [];
	return n && (n[r] = i), i;
}
var ki = (e) => e ? ns(e) ? ps(e) : ki(e.parent) : null, Ai = (e) => {
	let t = !1;
	for (;;) {
		if (e.patchFlag > 0 && e.patchFlag & 2048) {
			let n = _a(e.children);
			if (!n) return;
			e = n, t = !0;
			continue;
		}
		let n = e.component;
		if (n && n.subTree) {
			e = n.subTree;
			continue;
		}
		let r = e.suspense;
		if (r && r.activeBranch) e = r.activeBranch;
		else return t ? e.el : void 0;
	}
}, ji = (e) => {
	let t = e.subTree && Ai(e.subTree);
	return t === void 0 ? e.vnode.el : t;
}, Mi = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => process.env.NODE_ENV === "production" ? e.vnode.el : ji(e),
	$data: (e) => e.data,
	$props: (e) => process.env.NODE_ENV === "production" ? e.props : /* @__PURE__ */ Zt(e.props),
	$attrs: (e) => process.env.NODE_ENV === "production" ? e.attrs : /* @__PURE__ */ Zt(e.attrs),
	$slots: (e) => process.env.NODE_ENV === "production" ? e.slots : /* @__PURE__ */ Zt(e.slots),
	$refs: (e) => process.env.NODE_ENV === "production" ? e.refs : /* @__PURE__ */ Zt(e.refs),
	$parent: (e) => ki(e.parent),
	$root: (e) => ki(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => qi(e),
	$forceUpdate: (e) => e.f ||= () => {
		qn(e.update);
	},
	$nextTick: (e) => e.n ||= Gn.bind(e.proxy),
	$watch: (e) => Wr.bind(e)
}), Ni = (e) => e === "_" || e === "$", Pi = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Fi = {
	get({ _: e }, n) {
		if (n === "__v_skip") return !0;
		let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
		if (process.env.NODE_ENV !== "production" && n === "__isVue") return !0;
		if (n[0] !== "$") {
			let e = s[n];
			if (e !== void 0) switch (e) {
				case 1: return i[n];
				case 2: return a[n];
				case 4: return r[n];
				case 3: return o[n];
			}
			else if (Pi(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Hi && (s[n] = 0);
		}
		let d = Mi[n], f, p;
		if (d) return n === "$attrs" ? (P(e.attrs, "get", ""), process.env.NODE_ENV !== "production" && ma()) : process.env.NODE_ENV !== "production" && n === "$slots" && P(e, "get", n), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
		process.env.NODE_ENV !== "production" && jr && (!g(n) || n.indexOf("__v") !== 0) && (a !== t && Ni(n[0]) && u(a, n) ? z(`Property ${JSON.stringify(n)} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`) : e === jr && z(`Property ${JSON.stringify(n)} was accessed during render but is not defined on instance.`));
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Pi(a, n) ? (a[n] = r, !0) : process.env.NODE_ENV !== "production" && a.__isScriptSetup && u(a, n) ? (z(`Cannot mutate <script setup> binding "${n}" from Options API.`), !1) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) ? (process.env.NODE_ENV !== "production" && z(`Attempting to mutate prop "${n}". Props are readonly.`), !1) : n[0] === "$" && n.slice(1) in e ? (process.env.NODE_ENV !== "production" && z(`Attempting to mutate public property "${n}". Properties starting with $ are reserved and readonly.`), !1) : (process.env.NODE_ENV !== "production" && n in e.appContext.config.globalProperties ? Object.defineProperty(o, n, {
			enumerable: !0,
			configurable: !0,
			value: r
		}) : o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Pi(n, c) || u(o, c) || u(i, c) || u(Mi, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
process.env.NODE_ENV !== "production" && (Fi.ownKeys = (e) => (z("Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."), Reflect.ownKeys(e)));
function Ii(e) {
	let t = {};
	return Object.defineProperty(t, "_", {
		configurable: !0,
		enumerable: !1,
		get: () => e
	}), Object.keys(Mi).forEach((n) => {
		Object.defineProperty(t, n, {
			configurable: !0,
			enumerable: !1,
			get: () => Mi[n](e),
			set: r
		});
	}), t;
}
function Li(e) {
	let { ctx: t, propsOptions: [n] } = e;
	n && Object.keys(n).forEach((n) => {
		Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => e.props[n],
			set: r
		});
	});
}
function Ri(e) {
	let { ctx: t, setupState: n } = e;
	Object.keys(/* @__PURE__ */ F(n)).forEach((e) => {
		if (!n.__isScriptSetup) {
			if (Ni(e[0])) {
				z(`setup() return property ${JSON.stringify(e)} should not start with "$" or "_" which are reserved prefixes for Vue internals.`);
				return;
			}
			Object.defineProperty(t, e, {
				enumerable: !0,
				configurable: !0,
				get: () => n[e],
				set: r
			});
		}
	});
}
function zi(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Bi(e, t) {
	return !e || !t ? e || t : d(e) && d(t) ? e.concat(t) : s({}, zi(e), zi(t));
}
function Vi() {
	let e = /* @__PURE__ */ Object.create(null);
	return (t, n) => {
		e[n] ? z(`${t} property "${n}" is already defined in ${e[n]}.`) : e[n] = t;
	};
}
var Hi = !0;
function Ui(e) {
	let t = qi(e), n = e.proxy, i = e.ctx;
	Hi = !1, t.beforeCreate && Gi(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: b, deactivated: x, beforeDestroy: S, beforeUnmount: C, destroyed: ee, unmounted: w, render: te, renderTracked: T, renderTriggered: E, errorCaptured: ne, serverPrefetch: D, expose: O, inheritAttrs: k, components: re, directives: A, filters: j } = t, ie = process.env.NODE_ENV === "production" ? null : Vi();
	if (process.env.NODE_ENV !== "production") {
		let [t] = e.propsOptions;
		if (t) for (let e in t) ie("Props", e);
	}
	if (u && Wi(u, i, ie), s) for (let e in s) {
		let t = s[e];
		h(t) ? (process.env.NODE_ENV === "production" ? i[e] = t.bind(n) : Object.defineProperty(i, e, {
			value: t.bind(n),
			configurable: !0,
			enumerable: !0,
			writable: !0
		}), process.env.NODE_ENV !== "production" && ie("Methods", e)) : process.env.NODE_ENV !== "production" && z(`Method "${e}" has type "${typeof t}" in the component definition. Did you reference the function correctly?`);
	}
	if (a) {
		process.env.NODE_ENV !== "production" && !h(a) && z("The data option must be a function. Plain object usage is no longer supported.");
		let t = a.call(n, n);
		if (process.env.NODE_ENV !== "production" && y(t) && z("data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."), !v(t)) process.env.NODE_ENV !== "production" && z("data() should return an object.");
		else if (e.data = /* @__PURE__ */ Jt(t), process.env.NODE_ENV !== "production") for (let e in t) ie("Data", e), Ni(e[0]) || Object.defineProperty(i, e, {
			configurable: !0,
			enumerable: !0,
			get: () => t[e],
			set: r
		});
	}
	if (Hi = !0, o) for (let e in o) {
		let t = o[e], a = h(t) ? t.bind(n, n) : h(t.get) ? t.get.bind(n, n) : r;
		process.env.NODE_ENV !== "production" && a === r && z(`Computed property "${e}" has no getter.`);
		let s = X({
			get: a,
			set: !h(t) && h(t.set) ? t.set.bind(n) : process.env.NODE_ENV === "production" ? r : () => {
				z(`Write operation failed: computed property "${e}" is readonly.`);
			}
		});
		Object.defineProperty(i, e, {
			enumerable: !0,
			configurable: !0,
			get: () => s.value,
			set: (e) => s.value = e
		}), process.env.NODE_ENV !== "production" && ie("Computed", e);
	}
	if (c) for (let e in c) Ki(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			Lr(t, e[t]);
		});
	}
	f && Gi(f, e, "c");
	function ae(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (ae(mi, p), ae(hi, m), ae(gi, g), ae(_i, _), ae(ci, b), ae(li, x), ae(Ci, ne), ae(Si, T), ae(xi, E), ae(vi, C), ae(yi, w), ae(bi, D), d(O)) {
		if (O.length) {
			let t = e.exposed ||= {};
			O.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	te && e.render === r && (e.render = te), k != null && (e.inheritAttrs = k), re && (e.components = re), A && (e.directives = A), D && ei(e);
}
function Wi(e, t, n = r) {
	d(e) && (e = Qi(e));
	for (let r in e) {
		let i = e[r], a;
		a = v(i) ? "default" in i ? Rr(i.from || r, i.default, !0) : Rr(i.from || r) : Rr(i), /* @__PURE__ */ I(a) ? Object.defineProperty(t, r, {
			enumerable: !0,
			configurable: !0,
			get: () => a.value,
			set: (e) => a.value = e
		}) : t[r] = a, process.env.NODE_ENV !== "production" && n("Inject", r);
	}
}
function Gi(e, t, n) {
	Pn(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Ki(e, t, n, r) {
	let i = r.includes(".") ? Gr(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) ? Hr(i, n) : process.env.NODE_ENV !== "production" && z(`Invalid watch handler specified by key "${e}"`, n);
	} else if (h(e)) Hr(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Ki(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) ? Hr(i, r, e) : process.env.NODE_ENV !== "production" && z(`Invalid watch handler specified by key "${e.handler}"`, r);
		}
	} else process.env.NODE_ENV !== "production" && z(`Invalid watch option: "${r}"`, e);
}
function qi(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Ji(c, e, o, !0)), Ji(c, t, o)), v(t) && a.set(t, c), c;
}
function Ji(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Ji(e, a, n, !0), i && i.forEach((t) => Ji(e, t, n, !0));
	for (let i in t) if (r && i === "expose") process.env.NODE_ENV !== "production" && z("\"expose\" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.");
	else {
		let r = Yi[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Yi = {
	data: Xi,
	props: ta,
	emits: ta,
	methods: ea,
	computed: ea,
	beforeCreate: $i,
	created: $i,
	beforeMount: $i,
	mounted: $i,
	beforeUpdate: $i,
	updated: $i,
	beforeDestroy: $i,
	beforeUnmount: $i,
	destroyed: $i,
	unmounted: $i,
	activated: $i,
	deactivated: $i,
	errorCaptured: $i,
	serverPrefetch: $i,
	components: ea,
	directives: ea,
	watch: na,
	provide: Xi,
	inject: Zi
};
function Xi(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Zi(e, t) {
	return ea(Qi(e), Qi(t));
}
function Qi(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function $i(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function ea(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function ta(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), zi(e), zi(t ?? {})) : t;
}
function na(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = $i(e[r], t[r]);
	return n;
}
function ra() {
	return {
		app: null,
		config: {
			isNativeTag: i,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var ia = 0;
function aa(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (process.env.NODE_ENV !== "production" && z("root props passed to app.mount() must be an object."), r = null);
		let i = ra(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: ia++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: bs,
			get config() {
				return i.config;
			},
			set config(e) {
				process.env.NODE_ENV !== "production" && z("app.config cannot be replaced. Modify individual options instead.");
			},
			use(e, ...t) {
				return a.has(e) ? process.env.NODE_ENV !== "production" && z("Plugin has already been applied to target app.") : e && h(e.install) ? (a.add(e), e.install(l, ...t)) : h(e) ? (a.add(e), e(l, ...t)) : process.env.NODE_ENV !== "production" && z("A plugin must either be a function or an object with an \"install\" function."), l;
			},
			mixin(e) {
				return i.mixins.includes(e) ? process.env.NODE_ENV !== "production" && z("Mixin has already been applied to target app" + (e.name ? `: ${e.name}` : "")) : i.mixins.push(e), l;
			},
			component(e, t) {
				return process.env.NODE_ENV !== "production" && ts(e, i.config), t ? (process.env.NODE_ENV !== "production" && i.components[e] && z(`Component "${e}" has already been registered in target app.`), i.components[e] = t, l) : i.components[e];
			},
			directive(e, t) {
				return process.env.NODE_ENV !== "production" && Fr(e), t ? (process.env.NODE_ENV !== "production" && i.directives[e] && z(`Directive "${e}" has already been registered in target app.`), i.directives[e] = t, l) : i.directives[e];
			},
			mount(a, o, s) {
				if (c) process.env.NODE_ENV !== "production" && z("App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`");
				else {
					process.env.NODE_ENV !== "production" && a.__vue_app__ && z("There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first.");
					let u = l._ceVNode || K(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), process.env.NODE_ENV !== "production" && (i.reload = () => {
						let t = Ro(u);
						t.el = null, e(t, a, s);
					}), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, process.env.NODE_ENV !== "production" && (l._instance = u.component, br(l, bs)), ps(u.component);
				}
			},
			onUnmount(e) {
				process.env.NODE_ENV !== "production" && typeof e != "function" && z(`Expected function as first argument to app.onUnmount(), but got ${typeof e}`), o.push(e);
			},
			unmount() {
				c ? (Pn(o, l._instance, 16), e(null, l._container), process.env.NODE_ENV !== "production" && (l._instance = null, xr(l)), delete l._container.__vue_app__) : process.env.NODE_ENV !== "production" && z("Cannot unmount an app that is not mounted.");
			},
			provide(e, t) {
				return process.env.NODE_ENV !== "production" && e in i.provides && (u(i.provides, e) ? z(`App already provides property with key "${String(e)}". It will be overwritten with the new value.`) : z(`App already provides property with key "${String(e)}" inherited from its parent element. It will be overwritten with the new value.`)), i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = oa;
				oa = l;
				try {
					return e();
				} finally {
					oa = t;
				}
			}
		};
		return l;
	};
}
var oa = null;
function sa(e, n, r = t) {
	let i = Yo();
	if (process.env.NODE_ENV !== "production" && !i) return z("useModel() called without active instance."), /* @__PURE__ */ L();
	let a = D(n);
	if (process.env.NODE_ENV !== "production" && !i.propsOptions[0][a]) return z(`useModel() called with prop "${n}" which is not declared.`), /* @__PURE__ */ L();
	let o = k(n), s = ca(e, a), c = mn((s, c) => {
		let l, u = t, d;
		return Vr(() => {
			let t = e[a];
			j(l, t) && (l = t, c());
		}), {
			get() {
				return s(), r.get ? r.get(l) : l;
			},
			set(e) {
				let s = r.set ? r.set(e) : e;
				if (!j(s, l) && !(u !== t && j(e, u))) return;
				let f = i.vnode.props, p = !!(f && (n in f || a in f || o in f) && (`onUpdate:${n}` in f || `onUpdate:${a}` in f || `onUpdate:${o}` in f));
				p || (l = e, c()), i.emit(`update:${n}`, s), j(e, u) && (j(e, s) && !j(s, d) || p && u !== t && !j(s, l)) && c(), u = e, d = s;
			}
		};
	});
	return c[Symbol.iterator] = () => {
		let e = 0;
		return { next() {
			return e < 2 ? {
				value: e++ ? s || t : c,
				done: !1
			} : { done: !0 };
		} };
	}, c;
}
var ca = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${D(t)}Modifiers`] || e[`${k(t)}Modifiers`];
function la(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t;
	if (process.env.NODE_ENV !== "production") {
		let { emitsOptions: t, propsOptions: [i] } = e;
		if (t) {
			if (!(n in t)) i && A(D(n)) in i || z(`Component emitted event "${n}" but it is neither declared in the emits option nor as an "${A(D(n))}" prop.`);
			else {
				let e = t[n];
				h(e) && (e(...r) || z(`Invalid event arguments: event validation failed for event "${n}".`));
			}
		}
	}
	let a = r, o = n.startsWith("update:"), s = o && ca(i, n.slice(7));
	if (s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(oe))), process.env.NODE_ENV !== "production" && Ar(e, n, a), process.env.NODE_ENV !== "production") {
		let t = n.toLowerCase();
		t !== n && i[A(t)] && z(`Event "${t}" is emitted in component ${_s(e, e.type)} but the handler is registered for "${n}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${k(n)}" instead of "${n}".`);
	}
	let c, l = i[c = A(n)] || i[c = A(D(n))];
	!l && o && (l = i[c = A(k(n))]), l && Pn(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, Pn(u, e, 6, a);
	}
}
var ua = /* @__PURE__ */ new WeakMap();
function da(e, t, n = !1) {
	let r = n ? ua : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = da(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function fa(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, k(t)) || u(e, t));
}
var pa = !1;
function ma() {
	pa = !0;
}
function ha(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [s], slots: c, attrs: l, emit: u, render: d, renderCache: f, props: p, data: m, setupState: h, ctx: g, inheritAttrs: _ } = e, v = Nr(e), y, b;
	process.env.NODE_ENV !== "production" && (pa = !1);
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = process.env.NODE_ENV !== "production" && h.__isScriptSetup ? new Proxy(e, { get(e, t, n) {
				return z(`Property '${String(t)}' was accessed via 'this'. Avoid using 'this' in templates.`), Reflect.get(e, t, n);
			} }) : e;
			y = Bo(d.call(t, e, f, process.env.NODE_ENV === "production" ? p : /* @__PURE__ */ Zt(p), h, m, g)), b = l;
		} else {
			let e = t;
			process.env.NODE_ENV !== "production" && l === p && ma(), y = Bo(e.length > 1 ? e(process.env.NODE_ENV === "production" ? p : /* @__PURE__ */ Zt(p), process.env.NODE_ENV === "production" ? {
				attrs: l,
				slots: c,
				emit: u
			} : {
				get attrs() {
					return ma(), /* @__PURE__ */ Zt(l);
				},
				slots: c,
				emit: u
			}) : e(process.env.NODE_ENV === "production" ? p : /* @__PURE__ */ Zt(p), null)), b = t.props ? l : va(l);
		}
	} catch (t) {
		Co.length = 0, Fn(t, e, 1), y = K(xo);
	}
	let x = y, S;
	if (process.env.NODE_ENV !== "production" && y.patchFlag > 0 && y.patchFlag & 2048 && ([x, S] = ga(y)), b && _ !== !1) {
		let e = Object.keys(b), { shapeFlag: t } = x;
		if (e.length) {
			if (t & 7) s && e.some(o) && (b = ya(b, s)), x = Ro(x, b, !1, !0);
			else if (process.env.NODE_ENV !== "production" && !pa && x.type !== xo) {
				let e = Object.keys(l), t = [], n = [];
				for (let r = 0, i = e.length; r < i; r++) {
					let i = e[r];
					a(i) ? o(i) || t.push(i[2].toLowerCase() + i.slice(3)) : n.push(i);
				}
				n.length && z(`Extraneous non-props attributes (${n.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`), t.length && z(`Extraneous non-emits event listeners (${t.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`);
			}
		}
	}
	if (n.dirs && (process.env.NODE_ENV !== "production" && !ba(x) && z("Runtime directive used on component with non-element root node. The directives will not function as intended."), x = Ro(x, null, !1, !0), x.dirs = x.dirs ? x.dirs.concat(n.dirs) : n.dirs), n.transition) {
		let e = qr(x.type) && Xr(x) || x;
		process.env.NODE_ENV !== "production" && !ba(e) && z("Component inside <Transition> renders non-element root node that cannot be animated."), Zr(e, n.transition);
	}
	return process.env.NODE_ENV !== "production" && S ? S(x) : y = x, Nr(v), y;
}
var ga = (e) => {
	let t = e.children, n = e.dynamicChildren, r = _a(t, !1);
	if (!r) return [e, void 0];
	if (process.env.NODE_ENV !== "production" && r.patchFlag > 0 && r.patchFlag & 2048) return ga(r);
	let i = t.indexOf(r), a = n ? n.indexOf(r) : -1;
	return [Bo(r), (r) => {
		t[i] = r, n && (a > -1 ? n[a] = r : r.patchFlag > 0 && (e.dynamicChildren = [...n, r]));
	}];
};
function _a(e, t = !0) {
	let n;
	for (let r = 0; r < e.length; r++) {
		let i = e[r];
		if (Ao(i)) {
			if (i.type !== xo || i.children === "v-if") {
				if (n) return;
				if (n = i, process.env.NODE_ENV !== "production" && t && n.patchFlag > 0 && n.patchFlag & 2048) return _a(n.children);
			}
		} else return;
	}
	return n;
}
var va = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, ya = (e, t) => {
	let n = {};
	for (let r in e) o(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
}, ba = (e) => e.shapeFlag & 7 || e.type === xo;
function xa(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (process.env.NODE_ENV !== "production" && (i || s) && rr || t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? Sa(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (Ca(o, r, n) && !fa(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || Sa(r, o, l) : !!o;
	return !1;
}
function Sa(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || Ca(t, e, a) && !fa(n, a)) return !0;
	}
	return !1;
}
function Ca(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !De(r, i) : r !== i;
}
function wa({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var Ta = {}, Ea = () => Object.create(Ta), Da = (e) => Object.getPrototypeOf(e) === Ta;
function Oa(e, t, n, r = !1) {
	let i = {}, a = Ea();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), ja(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	process.env.NODE_ENV !== "production" && La(t || {}, i, e), e.props = n ? r ? i : /* @__PURE__ */ Yt(i) : e.type.props ? i : a, e.attrs = a;
}
function ka(e) {
	for (; e;) {
		if (e.type.__hmrId) return !0;
		e = e.parent;
	}
}
function Aa(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ F(i), [c] = e.propsOptions, l = !1;
	if (!(process.env.NODE_ENV !== "production" && ka(e)) && (r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (fa(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = D(o);
						i[t] = Ma(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		ja(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (u(t, a) || (r = k(a)) !== a && u(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = Ma(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && u(t, e) || (delete a[e], l = !0);
	}
	l && ut(e.attrs, "set", ""), process.env.NODE_ENV !== "production" && La(t || {}, i, e);
}
function ja(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (w(t)) continue;
		let l = n[t], d;
		a && u(a, d = D(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : fa(e.emitsOptions, t) || t in i && l === i[t] || (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ F(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = Ma(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function Ma(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = Qo(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === k(n)) && (r = !0));
	}
	return r;
}
var Na = /* @__PURE__ */ new WeakMap();
function Pa(e, r, i = !1) {
	let a = i ? Na : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = Pa(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		process.env.NODE_ENV !== "production" && !g(c[e]) && z("props must be strings when using array syntax.", c[e]);
		let n = D(c[e]);
		Fa(n) && (l[n] = t);
	}
	else if (c) {
		process.env.NODE_ENV !== "production" && !v(c) && z("invalid props options", c);
		for (let e in c) {
			let t = D(e);
			if (Fa(t)) {
				let n = c[e], r = l[t] = d(n) || h(n) ? { type: n } : s({}, n), i = r.type, a = !1, o = !0;
				if (d(i)) for (let e = 0; e < i.length; ++e) {
					let t = i[e], n = h(t) && t.name;
					if (n === "Boolean") {
						a = !0;
						break;
					}
					n === "String" && (o = !1);
				}
				else a = h(i) && i.name === "Boolean";
				r[0] = a, r[1] = o, (a || u(r, "default")) && f.push(t);
			}
		}
	}
	let m = [l, f];
	return v(e) && a.set(e, m), m;
}
function Fa(e) {
	return e[0] !== "$" && !w(e) || (process.env.NODE_ENV !== "production" && z(`Invalid prop name: "${e}" is a reserved property.`), !1);
}
function Ia(e) {
	return e === null ? "null" : typeof e == "function" ? e.name || "" : typeof e == "object" && e.constructor && e.constructor.name || "";
}
function La(e, t, n) {
	let r = /* @__PURE__ */ F(t), i = n.propsOptions[0], a = Object.keys(e).map((e) => D(e));
	for (let e in i) {
		let t = i[e];
		t != null && Ra(e, r[e], t, process.env.NODE_ENV === "production" ? r : /* @__PURE__ */ Zt(r), !a.includes(e));
	}
}
function Ra(e, t, n, r, i) {
	let { type: a, required: o, validator: s, skipCheck: c } = n;
	if (o && i) z("Missing required prop: \"" + e + "\"");
	else if (t != null || o) {
		if (a != null && a !== !0 && !c) {
			let n = !1, r = d(a) ? a : [a], i = [];
			for (let e = 0; e < r.length && !n; e++) {
				let { valid: a, expectedType: o } = Ba(t, r[e]);
				i.push(o || ""), n = a;
			}
			if (!n) {
				z(Va(e, t, i));
				return;
			}
		}
		s && !s(t, r) && z("Invalid prop: custom validator check failed for prop \"" + e + "\".");
	}
}
var za = /* @__PURE__ */ e("String,Number,Boolean,Function,Symbol,BigInt");
function Ba(e, t) {
	let n, r = Ia(t);
	if (r === "null") n = e === null;
	else if (za(r)) {
		let i = typeof e;
		n = i === r.toLowerCase(), !n && i === "object" && (n = e instanceof t);
	} else n = r === "Object" ? v(e) : r === "Array" ? d(e) : e instanceof t;
	return {
		valid: n,
		expectedType: r
	};
}
function Va(e, t, n) {
	if (n.length === 0) return `Prop type [] for prop "${e}" won't match anything. Did you mean to use type Array instead?`;
	let r = `Invalid prop: type check failed for prop "${e}". Expected ${n.map(re).join(" | ")}`, i = n[0], a = S(t), o = Ha(t, i), s = Ha(t, a);
	return n.length === 1 && Ua(i) && Wa(i, a) && (r += ` with value ${o}`), r += `, got ${a} `, Ua(a) && (r += `with value ${s}.`), r;
}
function Ha(e, t) {
	return _(e) ? e.toString() : t === "String" ? `"${e}"` : t === "Number" ? `${Number(e)}` : `${e}`;
}
function Ua(e) {
	return [
		"string",
		"number",
		"boolean"
	].some((t) => e.toLowerCase() === t);
}
function Wa(...e) {
	return e.every((e) => {
		let t = e.toLowerCase();
		return t !== "boolean" && t !== "symbol";
	});
}
var Ga = (e) => e === "_" || e === "_ctx" || e === "$stable", Ka = (e) => d(e) ? e.map(Bo) : [Bo(e)], qa = (e, t, n) => {
	if (t._n) return t;
	let r = Pr((...r) => (process.env.NODE_ENV !== "production" && Y && !(n === null && jr) && !(n && n.root !== Y.root) && z(`Slot "${e}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`), Ka(t(...r))), n);
	return r._c = !1, r;
}, Ja = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ga(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = qa(n, i, r);
		else if (i != null) {
			process.env.NODE_ENV !== "production" && z(`Non-function value encountered for slot "${n}". Prefer function slots for better performance.`);
			let e = Ka(i);
			t[n] = () => e;
		}
	}
}, Ya = (e, t) => {
	process.env.NODE_ENV !== "production" && !si(e.vnode) && z("Non-function value encountered for default slot. Prefer function slots for better performance.");
	let n = Ka(t);
	e.slots.default = () => n;
}, Xa = (e, t, n) => {
	for (let r in t) (n || !Ga(r)) && (e[r] = t[r]);
}, Za = (e, t, n) => {
	let r = e.slots = Ea();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Xa(r, t, n), n && ae(r, "_", e, !0)) : Ja(t, r);
	} else t && Ya(e, t);
}, Qa = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let t = n._;
		t ? process.env.NODE_ENV !== "production" && rr ? (Xa(a, n, r), ut(e, "set", "$slots")) : r && t === 1 ? o = !1 : Xa(a, n, r) : (o = !n.$stable, Ja(n, a)), s = n;
	} else n && (Ya(e, n), s = { default: 1 });
	if (o) for (let e in a) !Ga(e) && s[e] == null && delete a[e];
}, $a, eo;
function to(e, t) {
	e.appContext.config.performance && ro() && eo.mark(`vue-${t}-${e.uid}`), process.env.NODE_ENV !== "production" && Dr(e, t, ro() ? eo.now() : Date.now());
}
function no(e, t) {
	if (e.appContext.config.performance && ro()) {
		let n = `vue-${t}-${e.uid}`, r = n + ":end", i = `<${_s(e, e.type)}> ${t}`;
		eo.mark(r), eo.measure(i, n, r), eo.clearMeasures(i), eo.clearMarks(n), eo.clearMarks(r);
	}
	process.env.NODE_ENV !== "production" && Or(e, t, ro() ? eo.now() : Date.now());
}
function ro() {
	return $a === void 0 && (typeof window < "u" && window.performance ? ($a = !0, eo = window.performance) : $a = !1), $a;
}
function io() {
	let e = [];
	if (process.env.NODE_ENV !== "production" && e.length) {
		let t = e.length > 1;
		console.warn(`Feature flag${t ? "s" : ""} ${e.join(", ")} ${t ? "are" : "is"} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`);
	}
}
var ao = yo;
function oo(e) {
	return so(e);
}
function so(e, i) {
	io();
	let a = ce();
	a.__VUE__ = !0, process.env.NODE_ENV !== "production" && yr(a.__VUE_DEVTOOLS_GLOBAL_HOOK__, a);
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = process.env.NODE_ENV !== "production" && rr ? !1 : !!t.dynamicChildren) => {
		if (e === t) return;
		e && !jo(e, t) && (i = ye(e), me(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case bo:
				y(e, t, r, i);
				break;
			case xo:
				b(e, t, r, i);
				break;
			case So:
				e == null ? x(t, r, i, s) : process.env.NODE_ENV !== "production" && S(e, t, r, s);
				break;
			case H:
				re(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? te(e, t, r, i, a, o, s, c, l) : f & 6 ? A(e, t, r, i, a, o, s, c, l) : f & 64 || f & 128 ? u.process(e, t, r, i, a, o, s, c, l, xe) : process.env.NODE_ENV !== "production" && z("Invalid VNode type:", u, `(${typeof u})`);
		}
		d != null && a ? ii(d, e && e.ref, o, t || e, !t) : d == null && e && e.ref != null && ii(e.ref, null, o, e, !0);
	}, y = (e, t, n, r) => {
		if (e == null) o(t.el = u(t.children), n, r);
		else {
			let n = t.el = e.el;
			t.children !== e.children && f(n, t.children);
		}
	}, b = (e, t, n, r) => {
		e == null ? o(t.el = d(t.children || ""), n, r) : t.el = e.el;
	}, x = (e, t, n, r) => {
		[e.el, e.anchor] = _(e.children, t, n, r, e.el, e.anchor);
	}, S = (e, t, n, r) => {
		if (t.children !== e.children) {
			let i = h(e.anchor);
			ee(e), [t.el, t.anchor] = _(t.children, n, i, r);
		} else t.el = e.el, t.anchor = e.anchor;
	}, C = ({ el: e, anchor: t }, n, r) => {
		let i;
		for (; e && e !== t;) i = h(e), o(e, n, r), e = i;
		o(t, n, r);
	}, ee = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, te = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) T(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), D(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, T = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && ne(e.children, d, null, r, i, co(e, a), s, u), _ && Ir(e, null, r, "created"), E(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !w(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && Wo(f, r, e);
		}
		process.env.NODE_ENV !== "production" && (ae(d, "__vnode", e, !0), ae(d, "__vueParentComponent", r, !0)), _ && Ir(e, null, r, "beforeMount");
		let v = uo(i, g);
		if (v ? g.beforeEnter(d) : g && !g.persisted && (d[vo] = !0), o(d, t, n), (f = m && m.onVnodeMounted) || v || _) {
			let t = process.env.NODE_ENV !== "production" && rr;
			ao(() => {
				let n;
				process.env.NODE_ENV !== "production" && (n = ir(t));
				try {
					f && Wo(f, r, e), v && g.enter(d), _ && Ir(e, null, r, "mounted");
				} finally {
					process.env.NODE_ENV !== "production" && ir(n);
				}
			}, i);
		}
	}, E = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (process.env.NODE_ENV !== "production" && n.patchFlag > 0 && n.patchFlag & 2048 && (n = _a(n.children) || n), t === n || _o(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				E(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, ne = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? Vo(e[l]) : Bo(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, D = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el;
		process.env.NODE_ENV !== "production" && (l.__vnode = n);
		let { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && lo(r, !1), (g = h.onVnodeBeforeUpdate) && Wo(g, r, n, e), f && Ir(n, e, r, "beforeUpdate"), r && lo(r, !0), (process.env.NODE_ENV !== "production" && rr || d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length)) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? (O(e.dynamicChildren, d, l, r, i, co(n, a), o), process.env.NODE_ENV !== "production" && fo(e, n)) : s || ue(e, n, l, null, r, i, co(n, a), o, !1), u > 0) {
			if (u & 16) k(l, m, h, r, a);
			else if (u & 2 && m.class !== h.class && c(l, "class", null, h.class, a), u & 4 && c(l, "style", m.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = m[n], o = h[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && p(l, n.children);
		} else !s && d == null && k(l, m, h, r, a);
		((g = h.onVnodeUpdated) || f) && ao(() => {
			g && Wo(g, r, n, e), f && Ir(n, e, r, "updated");
		}, i);
	}, O = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || go(c), d = u && (c.type === H || !jo(c, l) || c.shapeFlag & 198) ? m(u) : n;
			v(c, l, d, null, r, i, a, o, !0);
		}
	}, k = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !w(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (w(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, re = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		process.env.NODE_ENV !== "production" && (rr || p & 2048) && (p = 0, l = !1, m = null), h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), ne(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (O(e.dynamicChildren, m, n, i, a, s, c), process.env.NODE_ENV === "production" ? (t.key != null || i && t === i.subTree) && fo(e, t, !0) : fo(e, t)) : ue(e, t, n, f, i, a, s, c, l);
	}, A = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : j(t, n, r, i, a, o, c) : oe(e, t, c);
	}, j = (e, t, n, r, i, a, o) => {
		let s = e.component = Jo(e, r, i);
		if (process.env.NODE_ENV !== "production" && s.type.__hmrId && sr(s), process.env.NODE_ENV !== "production" && (wn(e), to(s, "mount")), si(e) && (s.ctx.renderer = xe), process.env.NODE_ENV !== "production" && to(s, "init"), is(s, !1, o), process.env.NODE_ENV !== "production" && no(s, "init"), process.env.NODE_ENV !== "production" && rr && (e.el = null), s.asyncDep) {
			if (i && i.registerDep(s, se, o, a), !e.el) {
				let r = s.subTree = K(xo);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else se(s, e, t, n, i, a, o);
		process.env.NODE_ENV !== "production" && (Tn(), no(s, "mount"));
	}, oe = (e, t, n) => {
		let r = t.component = e.component;
		if (xa(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				process.env.NODE_ENV !== "production" && wn(t), t.el = e.el, t.placeholder = e.placeholder, le(r, t, n), process.env.NODE_ENV !== "production" && Tn();
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, se = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = mo(e);
					if (n) {
						t && (t.el = c.el, le(e, t, o)), n.asyncDep.then(() => {
							let t = () => {
								e.job.flags & 8 || (i && i.pendingBranch ? ao(t, i) : l());
							};
							t.flags = 48, ao(t, i);
						});
						return;
					}
				}
				let u = t, d;
				process.env.NODE_ENV !== "production" && wn(t || e.vnode), lo(e, !1), t ? (t.el = c.el, le(e, t, o)) : t = c, n && ie(n), (d = t.props && t.props.onVnodeBeforeUpdate) && Wo(d, s, t, c), lo(e, !0), process.env.NODE_ENV !== "production" && to(e, "render");
				let f = ha(e);
				process.env.NODE_ENV !== "production" && no(e, "render");
				let p = e.subTree;
				e.subTree = f, process.env.NODE_ENV !== "production" && to(e, "patch"), v(p, f, m(p.el || go(p)), ye(p), e, i, a), process.env.NODE_ENV !== "production" && no(e, "patch"), t.el = f.el, u === null && wa(e, f.el), r && ao(r, i), (d = t.props && t.props.onVnodeUpdated) && ao(() => Wo(d, s, t, c), i), process.env.NODE_ENV !== "production" && Cr(e), process.env.NODE_ENV !== "production" && Tn();
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = oi(t);
				if (lo(e, !1), l && ie(l), !m && (o = c && c.onVnodeBeforeMount) && Wo(o, d, t), lo(e, !0), s && Ce) {
					let t = () => {
						process.env.NODE_ENV !== "production" && to(e, "render"), e.subTree = ha(e), process.env.NODE_ENV !== "production" && no(e, "render"), process.env.NODE_ENV !== "production" && to(e, "hydrate"), Ce(s, e.subTree, e, i, null), process.env.NODE_ENV !== "production" && no(e, "hydrate");
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0), process.env.NODE_ENV !== "production" && to(e, "render");
					let o = e.subTree = ha(e);
					process.env.NODE_ENV !== "production" && no(e, "render"), process.env.NODE_ENV !== "production" && to(e, "patch"), v(null, o, n, r, e, i, a), process.env.NODE_ENV !== "production" && no(e, "patch"), t.el = o.el;
				}
				if (u && ao(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					ao(() => Wo(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && oi(d.vnode) && d.vnode.shapeFlag & 256) && e.a && ao(e.a, i), e.isMounted = !0, process.env.NODE_ENV !== "production" && Sr(e), t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Re(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => qn(u), lo(e, !0), process.env.NODE_ENV !== "production" && (c.onTrack = e.rtc ? (t) => ie(e.rtc, t) : void 0, c.onTrigger = e.rtg ? (t) => ie(e.rtg, t) : void 0), l();
	}, le = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, Aa(e, t.props, r, n), Qa(e, t.children, n), $e(), Xn(e), et();
	}, ue = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				fe(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				de(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && ve(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? fe(l, d, n, r, i, a, o, s, c) : ve(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && ne(d, n, r, i, a, o, s, c));
	}, de = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? Vo(t[p]) : Bo(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? ve(e, a, o, !0, !1, f) : ne(t, r, i, a, o, s, c, l, f);
	}, fe = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? Vo(t[u]) : Bo(t[u]);
			if (jo(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? Vo(t[p]) : Bo(t[p]);
			if (jo(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? Vo(t[u]) : Bo(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) me(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? Vo(t[u]) : Bo(t[u]);
				e.key != null && (process.env.NODE_ENV !== "production" && g.has(e.key) && z("Duplicate keys found during update:", JSON.stringify(e.key), "Make sure keys are unique."), g.set(e.key, u));
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					me(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && jo(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? me(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let ee = x ? po(C) : n;
			for (_ = ee.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || go(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== ee[_] ? pe(n, r, p, 2) : _--);
			}
		}
	}, pe = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) pe(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, xe);
		else if (c === H) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) pe(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === So) C(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[Jr] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), ao(() => l.enter(a), i));
			else {
				let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? s(a) : o(a, t, n);
				}, d = () => {
					let e = a._isLeaving || !!a[Jr];
					a._isLeaving && a[Jr](!0), l.persisted && !e ? u() : r(a, () => {
						u(), c && c();
					});
				};
				i ? i(a, u, d) : d();
			}
		} else o(a, t, n);
	}, me = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && ($e(), ii(s, null, n, e, !0), et()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256 && t.ctx.deactivate(e)) return;
		let h = u & 1 && f, g = !oi(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && Wo(_, t, e), u & 6) _e(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Ir(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, xe, r) : l && !l.hasOnce && (a !== H || d > 0 && d & 64) ? ve(l, t, n, !1, !0) : (a === H && d & 384 || !i && u & 16) && ve(c, t, n), r && he(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && ao(() => {
			_ && Wo(_, t, e), h && Ir(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, he = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === H;
		if (a && !i) {
			ge(n, r);
			return;
		}
		if (t === So) {
			ee(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? Qr(e) : e, c = () => {
			a ? m(n) && ge(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, ge = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, _e = (e, t, n) => {
		process.env.NODE_ENV !== "production" && e.type.__hmrId && cr(e);
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		ho(c), ho(l), r && ie(r), i.stop(), a ? (a.flags |= 8, me(o, e, t, n)) : o && (o.transition = e.vnode.transition, me(o, e, t, n)), s && ao(s, t);
		let u = () => {
			e.isUnmounted = !0;
		};
		u.flags = 16, ao(u, t), process.env.NODE_ENV !== "production" && Tr(e);
	}, ve = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) me(e[o], t, n, r, i);
	}, ye = (e) => {
		if (e.shapeFlag & 6) return ye(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Kr];
		return n ? h(n) : t;
	}, be = (e, t, n) => {
		$n(() => {
			e == null ? t._vnode && me(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : qo());
	}, xe = {
		p: v,
		um: me,
		m: pe,
		r: he,
		mt: j,
		mc: ne,
		pc: ue,
		pbc: O,
		n: ye,
		o: e
	}, Se, Ce;
	return i && ([Se, Ce] = i(xe)), {
		render: be,
		hydrate: Se,
		createApp: aa(be, Se)
	};
}
function co({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function lo({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function uo(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function fo(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = Vo(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && fo(t, a)), a.type === bo && (a.patchFlag === -1 && (a = i[e] = Vo(a)), a.el = t.el), a.type === xo && !a.el && (a.el = t.el), process.env.NODE_ENV !== "production" && a.el && (a.el.__vnode = a);
	}
}
function po(e) {
	let t = e.slice(), n = [0], r, i, a, o, s, c = e.length;
	for (r = 0; r < c; r++) {
		let c = e[r];
		if (c !== 0) {
			if (i = n[n.length - 1], e[i] < c) {
				t[r] = i, n.push(r);
				continue;
			}
			for (a = 0, o = n.length - 1; a < o;) s = a + o >> 1, e[n[s]] < c ? a = s + 1 : o = s;
			c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), n[a] = r);
		}
	}
	for (a = n.length, o = n[a - 1]; a-- > 0;) n[a] = o, o = t[o];
	return n;
}
function mo(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : mo(t);
}
function ho(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function go(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	if (t) return go(t.subTree);
	let n = e.suspense;
	return n && n.activeBranch ? go(n.activeBranch) : null;
}
var _o = (e) => e.__isSuspense, vo = /* @__PURE__ */ Symbol("_deferredEnter");
function yo(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : Yn(e);
}
var H = /* @__PURE__ */ Symbol.for("v-fgt"), bo = /* @__PURE__ */ Symbol.for("v-txt"), xo = /* @__PURE__ */ Symbol.for("v-cmt"), So = /* @__PURE__ */ Symbol.for("v-stc"), Co = [], wo = null;
function U(e = !1) {
	Co.push(wo = e ? null : []);
}
function To() {
	Co.pop(), wo = Co[Co.length - 1] || null;
}
var Eo = 1;
function Do(e, t = !1) {
	Eo += e, e < 0 && wo && t && (wo.hasOnce = !0);
}
function Oo(e) {
	return e.dynamicChildren = Eo > 0 ? wo || n : null, To(), Eo > 0 && wo && wo.push(e), e;
}
function W(e, t, n, r, i, a) {
	return Oo(G(e, t, n, r, i, a, !0));
}
function ko(e, t, n, r, i) {
	return Oo(K(e, t, n, r, i, !0));
}
function Ao(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function jo(e, t) {
	if (process.env.NODE_ENV !== "production" && t.shapeFlag & 6 && e.component) {
		let n = ar.get(t.type);
		if (n && n.has(e.component)) return e.shapeFlag &= -257, t.shapeFlag &= -513, !1;
	}
	return e.type === t.type && e.key === t.key;
}
var Mo = (...e) => Io(...e), No = ({ key: e }) => e ?? null, Po = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ I(e) || h(e) ? {
	i: jr,
	r: e,
	k: t,
	f: !!n
} : e);
function G(e, t = null, n = null, r = 0, i = null, a = e === H ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && No(t),
		ref: t && Po(t),
		scopeId: Mr,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: a,
		patchFlag: r,
		dynamicProps: i,
		dynamicChildren: null,
		appContext: null,
		ctx: jr
	};
	if (s ? (Ho(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), process.env.NODE_ENV !== "production" && c.key !== c.key && z("VNode created with invalid key (NaN). VNode type:", c.type), process.env.NODE_ENV !== "production" && t && c.shapeFlag & 1) {
		let e = t.innerHTML == null ? t.textContent == null ? null : "textContent" : "innerHTML";
		e && Fo(c.children) && z(`The \`${e}\` prop on <${c.type}> will override its children. Remove either the \`${e}\` prop or the children.`);
	}
	return Eo > 0 && !o && wo && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && wo.push(c), c;
}
function Fo(e) {
	return g(e) ? e !== "" : d(e) ? e.length > 0 : !1;
}
var K = process.env.NODE_ENV === "production" ? Io : Mo;
function Io(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== Ti || (process.env.NODE_ENV !== "production" && !e && z(`Invalid vnode type when creating vnode: ${e}.`), e = xo), Ao(e)) {
		let r = Ro(e, t, !0);
		return n && Ho(r, n), Eo > 0 && !a && wo && (r.shapeFlag & 6 ? wo[wo.indexOf(e)] = r : wo.push(r)), r.patchFlag = -2, r;
	}
	if (vs(e) && (e = e.__vccOpts), t) {
		t = Lo(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = me(e)), v(n) && (/* @__PURE__ */ nn(n) && !d(n) && (n = s({}, n)), t.style = le(n));
	}
	let o = g(e) ? 1 : _o(e) ? 128 : qr(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return process.env.NODE_ENV !== "production" && o & 4 && /* @__PURE__ */ nn(e) && (e = /* @__PURE__ */ F(e), z("Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.", "\nComponent that was made reactive: ", e)), G(e, t, n, r, i, o, a, !0);
}
function Lo(e) {
	return e ? /* @__PURE__ */ nn(e) ? s({}, e) : Da(e) ? s({}, e[ls] || e) : e : null;
}
function Ro(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? Uo(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && No(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(Po(t)) : [a, Po(t)] : Po(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: process.env.NODE_ENV !== "production" && o === -1 && d(s) ? s.map(zo) : s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== H ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && Ro(e.ssContent),
		ssFallback: e.ssFallback && Ro(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && Zr(u, c.clone(u)), u;
}
function zo(e) {
	let t = Ro(e);
	return d(e.children) && (t.children = e.children.map(zo)), t;
}
function q(e = " ", t = 0) {
	return K(bo, null, e, t);
}
function J(e = "", t = !1) {
	return t ? (U(), ko(xo, null, e)) : K(xo, null, e);
}
function Bo(e) {
	return e == null || typeof e == "boolean" ? K(xo) : d(e) ? K(H, null, e.slice()) : Ao(e) ? Vo(e) : K(bo, null, String(e));
}
function Vo(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : Ro(e);
}
function Ho(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), Ho(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !Da(t) ? t._ctx = jr : r === 3 && jr && (jr.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			Ho(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: jr
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [q(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function Uo(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = me([t.class, r.class]));
		else if (e === "style") t.style = le([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function Wo(e, t, n, r = null) {
	Pn(e, t, 7, [n, r]);
}
var Go = /* @__PURE__ */ ra(), Ko = 0;
function qo() {
	return Ko;
}
function Jo(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || Go, o = {
		uid: Ko++,
		vnode: e,
		type: i,
		parent: n,
		appContext: a,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new Fe(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: n ? n.provides : Object.create(a.provides),
		ids: n ? n.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: Pa(i, a),
		emitsOptions: da(i, a),
		emit: null,
		emitted: null,
		propsDefaults: t,
		inheritAttrs: i.inheritAttrs,
		ctx: t,
		data: t,
		props: t,
		attrs: t,
		slots: t,
		refs: t,
		setupState: t,
		setupContext: null,
		suspense: r,
		suspenseId: r ? r.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return o.ctx = process.env.NODE_ENV === "production" ? { _: o } : Ii(o), o.root = n ? n.root : o, o.emit = la.bind(null, o), e.ce && e.ce(o), o;
}
var Y = null, Yo = () => Y || jr, Xo, Zo;
{
	let e = ce(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	Xo = t("__VUE_INSTANCE_SETTERS__", (e) => Y = e), Zo = t("__VUE_SSR_SETTERS__", (e) => rs = e);
}
var Qo = (e) => {
	let t = Y;
	return Xo(e), e.scope.on(), () => {
		e.scope.off(), Xo(t);
	};
}, $o = () => {
	Y && Y.scope.off(), Xo(null);
}, es = /* @__PURE__ */ e("slot,component");
function ts(e, { isNativeTag: t }) {
	(es(e) || t(e)) && z("Do not use built-in or reserved HTML elements as component id: " + e);
}
function ns(e) {
	return e.vnode.shapeFlag & 4;
}
var rs = !1;
function is(e, t = !1, n = !1) {
	t && Zo(t);
	let { props: r, children: i } = e.vnode, a = ns(e);
	Oa(e, r, a, t), Za(e, i, n || t);
	let o = a ? as(e, t) : void 0;
	return t && Zo(!1), o;
}
function as(e, t) {
	let n = e.type;
	if (process.env.NODE_ENV !== "production") {
		if (n.name && ts(n.name, e.appContext.config), n.components) {
			let t = Object.keys(n.components);
			for (let n = 0; n < t.length; n++) ts(t[n], e.appContext.config);
		}
		if (n.directives) {
			let e = Object.keys(n.directives);
			for (let t = 0; t < e.length; t++) Fr(e[t]);
		}
		n.compilerOptions && ss() && z("\"compilerOptions\" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.");
	}
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Fi), process.env.NODE_ENV !== "production" && Li(e);
	let { setup: r } = n;
	if (r) {
		$e();
		let i = e.setupContext = r.length > 1 ? fs(e) : null, a = Qo(e), o = Nn(r, e, 0, [process.env.NODE_ENV === "production" ? e.props : /* @__PURE__ */ Zt(e.props), i]), s = y(o);
		if (et(), a(), (s || e.sp) && !oi(e) && ei(e), s) {
			if (o.then($o, $o), t) return o.then((n) => {
				Zo(!0);
				try {
					os(e, n, t);
				} finally {
					Zo(!1);
				}
			}).catch((t) => {
				Fn(t, e, 0, void 0, !0), e.ssrRender = (e, t) => t("<!---->");
			});
			e.asyncDep = o, process.env.NODE_ENV !== "production" && !e.suspense && z(`Component <${_s(e, n)}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`);
		} else os(e, o, t);
	} else cs(e, t);
}
function os(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) ? (process.env.NODE_ENV !== "production" && Ao(t) && z("setup() should not return VNodes directly - return a render function instead."), process.env.NODE_ENV !== "production" && (e.devtoolsRawSetupState = t), e.setupState = fn(t), process.env.NODE_ENV !== "production" && Ri(e)) : process.env.NODE_ENV !== "production" && t !== void 0 && z(`setup() should return an object. Received: ${t === null ? "null" : typeof t}`), cs(e, n);
}
var ss = () => !0;
function cs(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = Qo(e);
		$e();
		try {
			Ui(e);
		} finally {
			et(), t();
		}
	}
	process.env.NODE_ENV !== "production" && !i.render && e.render === r && !t && (i.template ? z("Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias \"vue\" to \"vue/dist/vue.esm-bundler.js\".") : z("Component is missing template or render function: ", i));
}
var ls = /* @__PURE__ */ Symbol(), us = process.env.NODE_ENV === "production" ? { get(e, t) {
	return P(e, "get", ""), t === ls ? e : e[t];
} } : {
	get(e, t) {
		return ma(), P(e, "get", ""), t === ls ? e : e[t];
	},
	set() {
		return z("setupContext.attrs is readonly."), !1;
	},
	deleteProperty() {
		return z("setupContext.attrs is readonly."), !1;
	}
};
function ds(e) {
	return new Proxy(e.slots, { get(t, n) {
		return P(e, "get", "$slots"), t[n];
	} });
}
function fs(e) {
	let t = (t) => {
		if (process.env.NODE_ENV !== "production" && (e.exposed && z("expose() should be called only once per setup()."), t != null)) {
			let e = typeof t;
			e === "object" && (d(t) ? e = "array" : /* @__PURE__ */ I(t) && (e = "ref")), e !== "object" && z(`expose() should be passed a plain object, received ${e}.`);
		}
		e.exposed = t || {};
	};
	if (process.env.NODE_ENV !== "production") {
		let n, r;
		return Object.freeze({
			get attrs() {
				return n ||= new Proxy(e.attrs, us);
			},
			get slots() {
				return r ||= ds(e);
			},
			get emit() {
				return (t, ...n) => e.emit(t, ...n);
			},
			expose: t
		});
	}
	return {
		attrs: new Proxy(e.attrs, us),
		slots: e.slots,
		emit: e.emit,
		expose: t
	};
}
function ps(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(fn(rn(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Mi) return Mi[n](e);
		},
		has(e, t) {
			return t in e || t in Mi;
		}
	}) : e.proxy;
}
var ms = /(?:^|[-_])\w/g, hs = (e) => e.replace(ms, (e) => e.toUpperCase()).replace(/[-_]/g, "");
function gs(e, t = !0) {
	return h(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function _s(e, t, n = !1) {
	let r = gs(t);
	if (!r && t.__file) {
		let e = t.__file.match(/([^/\\]+)\.\w+$/);
		e && (r = e[1]);
	}
	if (!r && e) {
		let n = (e) => {
			for (let n in e) if (e[n] === t) return n;
		};
		r = n(e.components) || e.parent && n(e.parent.type.components) || n(e.appContext.components);
	}
	return r ? hs(r) : n ? "App" : "Anonymous";
}
function vs(e) {
	return h(e) && "__vccOpts" in e;
}
var X = (e, t) => {
	let n = /* @__PURE__ */ gn(e, t, rs);
	if (process.env.NODE_ENV !== "production") {
		let e = Yo();
		e && e.appContext.config.warnRecursiveComputed && (n._warnRecursive = !0);
	}
	return n;
};
function ys() {
	if (process.env.NODE_ENV === "production" || typeof window > "u") return;
	let e = { style: "color:#3ba776" }, n = { style: "color:#1677ff" }, r = { style: "color:#f5222d" }, i = { style: "color:#eb2f96" }, a = {
		__vue_custom_formatter: !0,
		header(t) {
			if (!v(t)) return null;
			if (t.__isVue) return [
				"div",
				e,
				"VueInstance"
			];
			if (/* @__PURE__ */ I(t)) {
				$e();
				let n = t.value;
				return et(), [
					"div",
					{},
					[
						"span",
						e,
						p(t)
					],
					"<",
					l(n),
					">"
				];
			}
			return /* @__PURE__ */ $t(t) ? [
				"div",
				{},
				[
					"span",
					e,
					/* @__PURE__ */ tn(t) ? "ShallowReactive" : "Reactive"
				],
				"<",
				l(t),
				`>${/* @__PURE__ */ en(t) ? " (readonly)" : ""}`
			] : /* @__PURE__ */ en(t) ? [
				"div",
				{},
				[
					"span",
					e,
					/* @__PURE__ */ tn(t) ? "ShallowReadonly" : "Readonly"
				],
				"<",
				l(t),
				">"
			] : null;
		},
		hasBody(e) {
			return e && e.__isVue;
		},
		body(e) {
			if (e && e.__isVue) return [
				"div",
				{},
				...o(e.$)
			];
		}
	};
	function o(e) {
		let n = [];
		e.type.props && e.props && n.push(c("props", /* @__PURE__ */ F(e.props))), e.setupState !== t && n.push(c("setup", e.setupState)), e.data !== t && n.push(c("data", /* @__PURE__ */ F(e.data)));
		let r = u(e, "computed");
		r && n.push(c("computed", r));
		let a = u(e, "inject");
		return a && n.push(c("injected", a)), n.push([
			"div",
			{},
			[
				"span",
				{ style: i.style + ";opacity:0.66" },
				"$ (internal): "
			],
			["object", { object: e }]
		]), n;
	}
	function c(e, t) {
		return t = s({}, t), Object.keys(t).length ? [
			"div",
			{ style: "line-height:1.25em;margin-bottom:0.6em" },
			[
				"div",
				{ style: "color:#476582" },
				e
			],
			[
				"div",
				{ style: "padding-left:1.25em" },
				...Object.keys(t).map((e) => [
					"div",
					{},
					[
						"span",
						i,
						e + ": "
					],
					l(t[e], !1)
				])
			]
		] : ["span", {}];
	}
	function l(e, t = !0) {
		return typeof e == "number" ? [
			"span",
			n,
			e
		] : typeof e == "string" ? [
			"span",
			r,
			JSON.stringify(e)
		] : typeof e == "boolean" ? [
			"span",
			i,
			e
		] : v(e) ? ["object", { object: t ? /* @__PURE__ */ F(e) : e }] : [
			"span",
			r,
			String(e)
		];
	}
	function u(e, t) {
		let n = e.type;
		if (h(n)) return;
		let r = {};
		for (let i in e.ctx) f(n, i, t) && (r[i] = e.ctx[i]);
		return r;
	}
	function f(e, t, n) {
		let r = e[n];
		if (d(r) && r.includes(t) || v(r) && t in r || e.extends && f(e.extends, t, n) || e.mixins && e.mixins.some((e) => f(e, t, n))) return !0;
	}
	function p(e) {
		return /* @__PURE__ */ tn(e) ? "ShallowRef" : e.effect ? "ComputedRef" : "Ref";
	}
	window.devtoolsFormatters ? window.devtoolsFormatters.push(a) : window.devtoolsFormatters = [a];
}
var bs = "3.5.46", xs = process.env.NODE_ENV === "production" ? r : z;
process.env.NODE_ENV, process.env.NODE_ENV;
// node_modules/@vue/runtime-dom/dist/runtime-dom.esm-bundler.js
var Ss = void 0, Cs = typeof window < "u" && window.trustedTypes;
if (Cs) try {
	Ss = /* @__PURE__ */ Cs.createPolicy("vue", { createHTML: (e) => e });
} catch (e) {
	process.env.NODE_ENV !== "production" && xs(`Error creating trusted types policy: ${e}`);
}
var ws = Ss ? (e) => Ss.createHTML(e) : (e) => e, Ts = "http://www.w3.org/2000/svg", Es = "http://www.w3.org/1998/Math/MathML", Ds = typeof document < "u" ? document : null, Os = Ds && /* @__PURE__ */ Ds.createElement("template"), ks = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Ds.createElementNS(Ts, e) : t === "mathml" ? Ds.createElementNS(Es, e) : n ? Ds.createElement(e, { is: n }) : Ds.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Ds.createTextNode(e),
	createComment: (e) => Ds.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Ds.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Os.innerHTML = ws(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Os.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, As = /* @__PURE__ */ Symbol("_vtc");
function js(e, t, n) {
	let r = e[As];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Ms = /* @__PURE__ */ Symbol("_vod"), Ns = /* @__PURE__ */ Symbol("_vsh"), Ps = /* @__PURE__ */ Symbol(process.env.NODE_ENV === "production" ? "" : "CSS_VAR_TEXT");
process.env.NODE_ENV;
var Fs = /(?:^|;)\s*display\s*:/;
function Is(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? zs(r, t, "");
			}
			else for (let e in t) n[e] ?? zs(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? zs(r, i, "") : Us(e, i, !g(t) && t ? t[i] : void 0, o) || zs(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[Ps];
			e && (n += ";" + e), r.cssText = n, a = Fs.test(n);
		}
	} else t && e.removeAttribute("style");
	Ms in e && (i && t === n || (e[Ms] = a ? r.display : ""), e[Ns] && (r.display = "none"));
}
var Ls = /[^\\];\s*$/, Rs = /\s*!important$/;
function zs(e, t, n) {
	if (d(n)) n.forEach((n) => zs(e, t, n));
	else if (n ??= "", process.env.NODE_ENV !== "production" && Ls.test(n) && xs(`Unexpected semicolon at the end of '${t}' style value: '${n}'`), t.startsWith("--")) Rs.test(n) ? e.setProperty(t, n.replace(Rs, ""), "important") : e.setProperty(t, n);
	else {
		let r = Hs(e, t);
		Rs.test(n) ? e.setProperty(k(r), n.replace(Rs, ""), "important") : e[r] = n;
	}
}
var Bs = [
	"Webkit",
	"Moz",
	"ms"
], Vs = {};
function Hs(e, t) {
	let n = Vs[t];
	if (n) return n;
	let r = D(t);
	if (r !== "filter" && r in e) return Vs[t] = r;
	r = re(r);
	for (let n = 0; n < Bs.length; n++) {
		let i = Bs[n] + r;
		if (i in e) return Vs[t] = i;
	}
	return t;
}
function Us(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var Ws = "http://www.w3.org/1999/xlink";
function Gs(e, t, n, r, i, a = xe(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(Ws, t.slice(6, t.length)) : e.setAttributeNS(Ws, t, n) : n == null || a && !Se(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function Ks(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? ws(n) : n);
		return;
	}
	let a = e.tagName;
	if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
		let r = a === "OPTION" ? e.getAttribute("value") || "" : e.value, i = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
		r === i && "_value" in e || (e.value = i), n ?? e.removeAttribute(t), e._value = n;
		return;
	}
	let o = !1;
	if (n === "" || n == null) {
		let r = typeof e[t];
		r === "boolean" ? n = Se(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch (e) {
		process.env.NODE_ENV !== "production" && !o && xs(`Failed setting prop "${t}" on <${a.toLowerCase()}>: value ${n} is invalid.`, e);
	}
	o && e.removeAttribute(i || t);
}
function qs(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function Js(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var Ys = /* @__PURE__ */ Symbol("_vei");
function Xs(e, t, n, r, i = null) {
	let a = e[Ys] || (e[Ys] = {}), o = a[t];
	if (r && o) o.value = process.env.NODE_ENV === "production" ? r : ic(r, t);
	else {
		let [n, s] = $s(t);
		r ? qs(e, n, a[t] = rc(process.env.NODE_ENV === "production" ? r : ic(r, t), i), s) : o && (Js(e, n, o, s), a[t] = void 0);
	}
}
var Zs = /(Once|Passive|Capture)$/, Qs = /^on:?(?:Once|Passive|Capture)$/;
function $s(e) {
	let t, n;
	for (; (n = e.match(Zs)) && !Qs.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : k(e.slice(2)), t];
}
var ec = 0, tc = /* @__PURE__ */ Promise.resolve(), nc = () => ec ||= (tc.then(() => ec = 0), Date.now());
function rc(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (d(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && Pn(e, t, 5, a);
			}
		} else Pn(r, t, 5, [e]);
	};
	return n.value = e, n.attached = nc(), n;
}
function ic(e, t) {
	return h(e) || d(e) ? e : (xs(`Wrong type passed as event handler to ${t} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof e}.`), r);
}
var ac = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, oc = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? js(e, r, c) : t === "style" ? Is(e, n, r) : a(t) ? o(t) || Xs(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : sc(e, t, r, c)) ? (Ks(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || Gs(e, t, r, c, s, t !== "value")) : e._isVueCE && (cc(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? Ks(e, D(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), Gs(e, t, r, c));
};
function sc(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && ac(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return ac(t) && g(n) ? !1 : t in e;
}
function cc(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = D(t);
	return Array.isArray(n) ? n.some((e) => D(e) === r) : Object.keys(n).some((e) => D(e) === r);
}
var lc = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => ie(t, e) : t;
};
function uc(e) {
	e.target.composing = !0;
}
function dc(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var fc = /* @__PURE__ */ Symbol("_assign"), pc = /* @__PURE__ */ Symbol("_initialValue");
function mc(e, t, n) {
	return t && (e = e.trim()), n && (e = oe(e)), e;
}
var Z = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[pc] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[pc] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[fc] = lc(i);
		let a = r || i.props && i.props.type === "number";
		qs(e, t ? "change" : "input", (t) => {
			t.target.composing || e[fc](mc(e.value, n, a));
		}), (n || a) && qs(e, "change", () => {
			e.value = mc(e.value, n, a);
		}), t || (qs(e, "compositionstart", uc), qs(e, "compositionend", dc), qs(e, "change", dc));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[pc];
		delete e[pc], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[fc](mc(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[fc] = lc(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? oe(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, hc = {
	deep: !0,
	created(e, t, n) {
		e[fc] = lc(n), qs(e, "change", () => {
			let t = e._modelValue, n = bc(e), r = e.checked, i = e[fc];
			if (d(t)) {
				let e = Oe(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(xc(e, r));
		});
	},
	mounted: gc,
	beforeUpdate(e, t, n) {
		e[fc] = lc(n), gc(e, t, n);
	}
};
function gc(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = Oe(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = De(t, xc(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var _c = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, qs(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? oe(bc(e)) : bc(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[fc](i);
			} finally {
				Gn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[fc] = lc(r);
	},
	mounted(e, { value: t, modifiers: { number: n } }) {
		yc(e, t, n);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[fc] = lc(n);
	},
	updated(e, { value: t, modifiers: { number: n } }) {
		let r = e._pendingValue;
		e._pendingValue = void 0, r && r[0] === e.multiple && vc(t, r[1], r[0]) || yc(e, t, n);
	}
};
function vc(e, t, n) {
	if (!n || d(e)) return De(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function yc(e, t, n = !1) {
	let r = e.multiple, i = d(t);
	if (r && !i && !p(t)) process.env.NODE_ENV !== "production" && xs(`<select multiple v-model> expects an Array or Set value for its binding, but got ${Object.prototype.toString.call(t).slice(8, -1)}.`);
	else {
		for (let a = 0, o = e.options.length; a < o; a++) {
			let o = e.options[a], s = bc(o);
			if (r) {
				if (i) {
					let e = typeof s;
					o.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(s)) : Oe(t, s) > -1;
				} else o.selected = t.has(s) || n && typeof s == "string" && t.has(oe(s));
			} else if (De(bc(o), t)) {
				e.selectedIndex !== a && (e.selectedIndex = a);
				return;
			}
		}
		!r && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function bc(e) {
	return "_value" in e ? e._value : e.value;
}
function xc(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Sc = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Cc = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, t) => Sc.some((n) => e[`${n}Key`] && !t.includes(n))
}, wc = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Cc[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Tc = /* @__PURE__ */ s({ patchProp: oc }, ks), Ec;
function Dc() {
	return Ec ||= oo(Tc);
}
var Oc = ((...e) => {
	let t = Dc().createApp(...e);
	process.env.NODE_ENV !== "production" && (Ac(t), jc(t));
	let { mount: n } = t;
	return t.mount = (e) => {
		let r = Mc(e);
		if (!r) return;
		let i = t._component;
		h(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, kc(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function kc(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Ac(e) {
	Object.defineProperty(e.config, "isNativeTag", {
		value: (e) => ve(e) || ye(e) || be(e),
		writable: !1
	});
}
function jc(e) {
	if (ss()) {
		let t = e.config.isCustomElement;
		Object.defineProperty(e.config, "isCustomElement", {
			get() {
				return t;
			},
			set() {
				xs("The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead.");
			}
		});
		let n = e.config.compilerOptions, r = "The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka \"full build\"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader's `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc";
		Object.defineProperty(e.config, "compilerOptions", {
			get() {
				return xs(r), n;
			},
			set() {
				xs(r);
			}
		});
	}
}
function Mc(e) {
	if (g(e)) {
		let t = document.querySelector(e);
		return process.env.NODE_ENV !== "production" && !t && xs(`Failed to mount app: mount target selector "${e}" returned null.`), t;
	}
	return process.env.NODE_ENV !== "production" && window.ShadowRoot && e instanceof window.ShadowRoot && e.mode === "closed" && xs("mounting on a ShadowRoot with `{mode: \"closed\"}` may lead to unpredictable bugs"), e;
}
// node_modules/vue/dist/vue.runtime.esm-bundler.js
function Nc() {
	ys();
}
process.env.NODE_ENV !== "production" && Nc();
var Pc = "scene_diary", Fc = [
	"preference",
	"habit",
	"promise",
	"relationship",
	"event",
	"item_place"
], Ic = Object.freeze({
	recentDiaryCount: 2,
	recallMessageCount: 3,
	recallLimit: 8,
	recallScoreThreshold: .3,
	memoryTokenBudget: 1200,
	diaryTargetLength: "400–800 Chinese characters",
	maxDiaryChars: 9e3,
	maxGrowthChars: 4e3,
	diaryConnectionProfile: "",
	memoryConnectionProfile: "",
	maintenanceConnectionProfile: "",
	maintenanceCandidateLimit: 20,
	maintenanceScoreThreshold: .15,
	semantic: {
		enabled: !1,
		endpoint: "",
		model: "",
		dimensions: null,
		rerank: !1,
		rerankEndpoint: "",
		rerankModel: ""
	},
	extraction: {
		user: {
			bodyTagPairs: [],
			storyTimeTagPairs: [],
			requiredStoryTime: !1
		},
		character: {
			bodyTagPairs: [],
			storyTimeTagPairs: [],
			requiredStoryTime: !1
		}
	},
	prompts: {
		diary: "你是 {{char}} 的恋爱陪伴日记整理器。只依据角色设定与 [本幕对话]，以第一人称写日记；不要补写事实。",
		memory: "你是恋爱陪伴记忆提取器。只依据 [本幕对话] 提取已发生或已明确确认的事实。承诺已经作出可以记录，但承诺内容未发生时不得写成已经完成。不要补写事实。",
		growth: "你是 {{char}} 的角色成长与恋爱关系发展整理器。根据 [当前角色成长] 和 [本幕对话]，重写截至本幕结束的完整角色成长记录。重点维护 {{char}} 的性格成长、情感变化、生活状态变化，以及 {{char}} 与 {{user}} 从相识至今的关系发展路径。说明重要经历如何影响角色及双方关系，但不要逐条复述剧情，不要补写未发生或未确认的变化，也不要假定下一幕与本幕在时间、地点或事件上连续。",
		maintenance: "你是记忆库语义整理器。素材只有提供的已保存记忆及关联，不读取或补写外部事实。寻找同一事实的重复表达并建议合并；不同时间分别成立、发展、兑现、取消的事实保持独立并建议关联。仅人物或地点相同不足以关联。所有结果只是供用户批准的建议。"
	}
}), Lc = (e) => Array.isArray(e) ? e : [], Q = (e) => e == null ? "" : String(e).trim(), Rc = (e, t, n, r) => Math.min(n, Math.max(t, Number.isFinite(+e) ? +e : r));
function zc(e) {
	return (typeof e == "number" || typeof e == "string" && e.trim()) && Number.isFinite(+e) ? Rc(e, 0, 1, Ic.recallScoreThreshold) : Ic.recallScoreThreshold;
}
var Bc = () => Date.now();
function Vc(e = "sd") {
	return `${e}_${crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
}
function Hc() {
	return {
		timestamp: Bc(),
		timezoneOffset: (/* @__PURE__ */ new Date()).getTimezoneOffset()
	};
}
function Uc() {
	return {
		content: "",
		createdAt: null,
		updatedAt: null,
		timezoneOffset: null,
		revision: 0,
		lastIncludedActId: null,
		edited: !1,
		reviewRecommended: !1
	};
}
function Wc(e = {}) {
	let t = e && typeof e == "object" ? e : {};
	return {
		...Uc(),
		content: Q(t.content ?? t.text),
		createdAt: Number.isFinite(+t.createdAt) && +t.createdAt > 0 ? +t.createdAt : null,
		updatedAt: Number.isFinite(+t.updatedAt) && +t.updatedAt > 0 ? +t.updatedAt : null,
		timezoneOffset: t.timezoneOffset != null && Number.isFinite(+t.timezoneOffset) ? +t.timezoneOffset : null,
		revision: +t.revision || 0,
		lastIncludedActId: +t.lastIncludedActId || null,
		edited: !!t.edited,
		reviewRecommended: !!t.reviewRecommended
	};
}
function Gc(e = 1, t = Bc()) {
	return {
		id: e,
		status: "active",
		messageIds: [],
		startMessageIndex: null,
		endMessageIndex: null,
		startSceneTime: null,
		endSceneTime: null,
		title: "",
		diary: "",
		createdAt: t,
		closedAt: null,
		edited: !1,
		dirty: !1,
		revision: 0,
		sourceFingerprint: ""
	};
}
function Kc(e = Bc()) {
	return {
		version: 6,
		currentActId: 1,
		status: "active",
		acts: [Gc(1, e)],
		memories: [],
		memoryRevision: 0,
		memorySpaceId: Vc("space"),
		memoryLinks: [],
		memoryOrganization: null,
		maintenanceTransaction: null,
		characterGrowth: Uc(),
		pendingTransaction: null,
		drafts: [],
		settings: structuredClone(Ic),
		lastUpdatedAt: e
	};
}
function qc(e) {
	let t = Q(e?.open), n = Q(e?.close), r = t.match(/^<([A-Za-z][A-Za-z0-9:_-]*)>$/), i = n.match(/^<\/([A-Za-z][A-Za-z0-9:_-]*)>$/);
	return r && i && r[1] === i[1] ? {
		open: t,
		close: n
	} : null;
}
var Jc = (e) => Lc(e).map((e) => ({
	open: `<${Q(e).replace(/^<|>$/g, "")}>`,
	close: `</${Q(e).replace(/^<|>$/g, "")}>`
})), Yc = (e, t) => Lc(e).length ? Lc(e).map(qc).filter(Boolean) : Jc(t).map(qc).filter(Boolean), Xc = (e) => ({
	bodyTagPairs: Yc(e?.bodyTagPairs, e?.bodyTags),
	storyTimeTagPairs: Yc(e?.storyTimeTagPairs, e?.storyTimeTags),
	requiredStoryTime: !!e?.requiredStoryTime
});
function Zc(e = {}) {
	let { growthTargetLength: t, diaryTokenBudget: n, ...r } = e;
	return {
		...Ic,
		...r,
		recentDiaryCount: Rc(e.recentDiaryCount, 0, 20, 2),
		recallMessageCount: Rc(e.recallMessageCount, 1, 20, 3),
		recallLimit: Rc(e.recallLimit, 0, 30, 8),
		recallScoreThreshold: zc(e.recallScoreThreshold),
		maintenanceConnectionProfile: Q(e.maintenanceConnectionProfile),
		maintenanceCandidateLimit: Math.trunc(Rc(e.maintenanceCandidateLimit, 1, 60, 20)),
		maintenanceScoreThreshold: (typeof e.maintenanceScoreThreshold == "number" || typeof e.maintenanceScoreThreshold == "string" && e.maintenanceScoreThreshold.trim()) && Number.isFinite(+e.maintenanceScoreThreshold) ? Rc(e.maintenanceScoreThreshold, 0, 1, .15) : .15,
		maxGrowthChars: Ic.maxGrowthChars,
		semantic: {
			enabled: !!e.semantic?.enabled,
			endpoint: Q(e.semantic?.endpoint),
			model: Q(e.semantic?.model),
			dimensions: Number.isInteger(+e.semantic?.dimensions) && +e.semantic.dimensions > 0 ? +e.semantic.dimensions : null,
			rerank: !!e.semantic?.rerank,
			rerankEndpoint: Q(e.semantic?.rerankEndpoint),
			rerankModel: Q(e.semantic?.rerankModel)
		},
		extraction: {
			user: Xc(e.extraction?.user || Ic.extraction.user),
			character: Xc(e.extraction?.character || Ic.extraction.character)
		},
		prompts: {
			diary: Q(e.prompts?.diary) || "你是 {{char}} 的恋爱陪伴日记整理器。只依据角色设定与 [本幕对话]，以第一人称写日记；不要补写事实。",
			memory: Q(e.prompts?.memory) || "你是恋爱陪伴记忆提取器。只依据 [本幕对话] 提取已发生或已明确确认的事实。承诺已经作出可以记录，但承诺内容未发生时不得写成已经完成。不要补写事实。",
			growth: Q(e.prompts?.growth) || "你是 {{char}} 的角色成长与恋爱关系发展整理器。根据 [当前角色成长] 和 [本幕对话]，重写截至本幕结束的完整角色成长记录。重点维护 {{char}} 的性格成长、情感变化、生活状态变化，以及 {{char}} 与 {{user}} 从相识至今的关系发展路径。说明重要经历如何影响角色及双方关系，但不要逐条复述剧情，不要补写未发生或未确认的变化，也不要假定下一幕与本幕在时间、地点或事件上连续。",
			maintenance: Q(e.prompts?.maintenance) || "你是记忆库语义整理器。素材只有提供的已保存记忆及关联，不读取或补写外部事实。寻找同一事实的重复表达并建议合并；不同时间分别成立、发展、兑现、取消的事实保持独立并建议关联。仅人物或地点相同不足以关联。所有结果只是供用户批准的建议。"
		}
	};
}
function Qc(e = {}) {
	let { sources: t, sourceActId: n, sourceMessageIds: r, lifecycle: i, supersedes: a, mergedInto: o, revision: s, status: c, dirty: l, reviewRecommended: u, sourceFingerprint: d, accepted: f, disabled: p, ...m } = e, h = Hc();
	return {
		...m,
		id: Q(e.id) || Vc("memory"),
		category: Fc.includes(e.category) ? e.category : "event",
		title: Q(e.title).slice(0, 120),
		content: Q(e.content),
		people: [...new Set(Lc(e.people).map(Q).filter(Boolean))],
		aliases: [...new Set(Lc(e.aliases).map(Q).filter(Boolean))],
		importance: Math.round(Rc(e.importance, 1, 5, 3)),
		storyTime: Q(e.storyTime) || null,
		createdAt: +e.createdAt || h.timestamp,
		updatedAt: +e.updatedAt || h.timestamp,
		timezoneOffset: Number.isFinite(+e.timezoneOffset) ? +e.timezoneOffset : h.timezoneOffset,
		locked: !!e.locked,
		permanent: !!e.permanent,
		deletedAt: +e.deletedAt || null,
		edited: !!e.edited
	};
}
function $c(e, t) {
	let n = new Set(t.filter((e) => !e.deletedAt).map((e) => e.id)), r = /* @__PURE__ */ new Set();
	return Lc(e).flatMap((e) => {
		let [t, i] = [Q(e?.a), Q(e?.b)].sort(), a = JSON.stringify([t, i]);
		return !t || t === i || !n.has(t) || !n.has(i) || r.has(a) ? [] : (r.add(a), [{
			a: t,
			b: i,
			reason: Q(e.reason).slice(0, 300)
		}]);
	});
}
function el(e, t) {
	if (e?.version !== 1 || !Number.isFinite(e.initializedAt) || e.initializedAt <= 0 || !e.reviewed || typeof e.reviewed != "object" || Array.isArray(e.reviewed)) return null;
	let n = Object.fromEntries(t.filter((t) => Object.hasOwn(e.reviewed, t.id) && typeof e.reviewed[t.id] == "string").map((t) => [t.id, e.reviewed[t.id]]));
	return {
		version: 1,
		initializedAt: e.initializedAt,
		lastOrganizedAt: Number.isFinite(e.lastOrganizedAt) && e.lastOrganizedAt > 0 ? e.lastOrganizedAt : e.initializedAt,
		reviewed: n
	};
}
function tl(e) {
	if (!e) return null;
	if (e.version === 2 || e.status === "preview" || e.status === "legacy") return e;
	let t = structuredClone(e);
	return t.version !== 2 && t.status !== "preview" && (t.status = "legacy", t.error = "旧版未完成整理需要重新发起；可查看已完成批次或取消。"), t;
}
function nl(e) {
	let t = Kc(), n = e && typeof e == "object" ? e : {}, r = Number.isFinite(+n.version) ? +n.version : 0;
	if (r > 6) throw Error(`聊天数据版本 ${n.version} 高于支持版本 6`);
	let { maintenanceHistory: i, ...a } = n, o = Lc(n.acts).map((e, t) => ({
		...Gc(+e?.id || t + 1, +e?.createdAt || Bc()),
		...e,
		id: +e?.id || t + 1,
		messageIds: Lc(e?.messageIds).map(String),
		status: [
			"active",
			"closing",
			"closed"
		].includes(e?.status) ? e.status : "active"
	})), s = o.length ? o : t.acts, c = s.some((e) => e.id === +n.currentActId) ? +n.currentActId : s.at(-1).id, l = Lc(n.memories).filter((e) => e && !e.deletedAt && !["archived", "superseded"].includes(e.lifecycle)).map(Qc), u = n.pendingTransaction ? structuredClone(n.pendingTransaction) : null;
	return r < 5 && u && (delete u.memoryCandidates, delete u.memoryRejected, u.results ||= {}, u.results.memory = {
		status: "error",
		error: "记忆协议已升级，请重新提取本幕记忆。"
	}), {
		...t,
		...a,
		version: 6,
		acts: s,
		currentActId: c,
		status: [
			"active",
			"closing",
			"preview",
			"pending_next_act"
		].includes(n.status) ? n.status : "active",
		memories: l,
		memoryLinks: $c(n.memoryLinks, l),
		memoryOrganization: r < 5 ? null : el(n.memoryOrganization, l),
		memoryRevision: +n.memoryRevision || 0,
		memorySpaceId: Q(n.memorySpaceId) || t.memorySpaceId,
		pendingTransaction: u,
		maintenanceTransaction: r < 5 ? null : tl(n.maintenanceTransaction),
		characterGrowth: Wc(n.characterGrowth && typeof n.characterGrowth == "object" ? n.characterGrowth : n.summary),
		settings: Zc(n.settings),
		drafts: Lc(n.drafts)
	};
}
var rl = (e) => Lc(e?.acts).find((t) => t.id === e.currentActId) || Lc(e?.acts).at(-1) || null, il = (e, t) => Lc(e?.acts).find((e) => e.id === +t) || null;
function al(e) {
	let t = 2166136261;
	for (let n of String(e ?? "")) t ^= n.charCodeAt(0), t = Math.imul(t, 16777619);
	return (t >>> 0).toString(16);
}
function ol(e) {
	return al(Lc(e).map((e) => `${e?.extra?.scene_diary?.messageId || ""}:${e?.mes || ""}`).join("\n"));
}
function sl(e, t, n = null) {
	e.extra ||= {}, e.extra.scene_diary ||= {};
	let r = e.extra.scene_diary;
	return r.messageId ||= Vc("msg"), t != null && (r.actId = +t), n != null && (r.messageIndex = +n), r;
}
function cl(e) {
	return !!e && !e.is_system && e.extra?.type !== "narrator" && !e.extra?.tool_invocations && !e.extra?.scene_diary?.injected && !e.is_hidden;
}
function ll(e, t, n, r = null) {
	let i = sl(t, n, r).messageId, a = il(e, n);
	return a && !a.messageIds.includes(i) && a.messageIds.push(i), i;
}
function ul(e, t, n = null) {
	let r = rl(e), i = Gc(Math.max(...e.acts.map((e) => e.id), 0) + 1);
	return i.startMessageIndex = n, e.acts.push(i), e.currentActId = i.id, e.status = "active", r && (r.status = "closed"), t && ll(e, t, i.id, n), i;
}
function dl(e, t) {
	return Lc(e).filter((e) => !cl(e) || +e.extra?.scene_diary?.actId == +t);
}
function fl(e, t) {
	let n = String(e || ""), r = [], i = 0;
	for (; i < n.length;) {
		let e = n.indexOf(t.open, i);
		if (e < 0) break;
		let a = e + t.open.length, o = n.indexOf(t.close, a);
		if (o < 0) break;
		r.push({
			index: e,
			value: n.slice(a, o)
		}), i = o + t.close.length;
	}
	return r;
}
function pl(e, t, n) {
	return Yc(e?.[t], e?.[n]);
}
function ml(e, t) {
	let n = String(e || ""), r = pl(t, "bodyTagPairs", "bodyTags"), i = r.flatMap((e) => fl(n, e)).sort((e, t) => e.index - t.index), a = r.length ? i.map((e) => e.value.trim()).filter(Boolean).filter((e, t, n) => !n.slice(0, t).some((t) => t.includes(e))).join("\n\n") : n.trim(), o = pl(t, "storyTimeTagPairs", "storyTimeTags").flatMap((e) => fl(n, e)).sort((e, t) => e.index - t.index).map((e) => e.value.replace(/<[^>]*>/g, " ").trim()).find(Boolean) || null, s = [];
	return r.length && !i.length && s.push("未匹配任何正文标签对"), a || s.push("提取后的正文为空"), t?.requiredStoryTime && !o && s.push("未匹配必填故事时间标签对"), {
		body: a,
		storyTime: o,
		errors: s
	};
}
function hl(e, t, n, r) {
	let i = [], a = [];
	for (let o of Lc(e)) {
		let e = ml(o.mes, o.is_user ? t.user : t.character), s = o.extra?.scene_diary?.messageId || "";
		e.errors.length && a.push({
			id: s,
			index: o.extra?.scene_diary?.messageIndex,
			errors: e.errors
		}), i.push({
			id: s,
			speaker: o.is_user ? r : o.name || n,
			...e
		});
	}
	return {
		rows: i,
		errors: a,
		text: i.map((e) => `${e.speaker}: ${e.body}${e.storyTime ? `\n[故事时间：${e.storyTime}]` : ""}`).join("\n\n")
	};
}
function gl(e, t) {
	let n = [], r = [];
	for (let i of Lc(e)) {
		if (!cl(i) || !Q(i.mes)) continue;
		let e = ml(i.mes, i.is_user ? t.user : t.character), a = i.extra?.scene_diary?.messageId || "";
		e.errors.length && r.push({
			id: a,
			index: i.extra?.scene_diary?.messageIndex,
			errors: e.errors
		}), n.push({
			id: a,
			isUser: !!i.is_user,
			speaker: i.name || (i.is_user ? "玩家" : "角色"),
			...e
		});
	}
	return {
		rows: n,
		errors: r,
		text: n.map((e) => `${e.speaker}: ${e.body}`).join("\n\n")
	};
}
function _l(e, t) {
	return String(e || "").replace(/{{(char|user)}}/g, (e, n) => String(t[n] ?? ""));
}
function vl(e = {}) {
	return [
		["角色描述", e.description],
		["性格", e.personality],
		["当前场景", e.scenario]
	].filter(([, e]) => Q(e)).map(([e, t]) => `[${e}]\n${Q(t)}`).join("\n\n");
}
var yl = (e) => Math.ceil(String(e || "").length / 2);
function bl(e) {
	let t = String(e || "").toLocaleLowerCase(), n = [];
	try {
		if (Intl.Segmenter) for (let e of new Intl.Segmenter("zh", { granularity: "word" }).segment(t)) e.isWordLike && e.segment.trim() && n.push(e.segment);
	} catch {}
	for (let e of t.match(/[\u4e00-\u9fff]{2,}/g) || []) for (let t = 0; t < e.length - 1; t++) n.push(e.slice(t, t + 2));
	return [.../* @__PURE__ */ new Set([...n, ...t.split(/[^\p{L}\p{N}_-]+/u).filter((e) => e.length > 1)])];
}
var xl = (e) => `${e.content}${e.storyTime ? `（故事时间：${e.storyTime}）` : ""}`;
function Sl(e, t) {
	if (!Array.isArray(e) || !Q(t)) return -1;
	let n = e.findIndex((e) => [
		"user",
		"assistant",
		"tool"
	].includes(e?.role)), r = n < 0 ? e.length : n;
	return e.splice(r, 0, {
		role: "system",
		content: String(t)
	}), r;
}
// memory-system.js
var Cl = (e) => String(e ?? "").trim(), wl = (e) => e && !e.deletedAt, Tl = (e) => Cl(e.content), El = /* @__PURE__ */ new Map();
function Dl(e, t) {
	let n = `${t}:${al(e.map((e) => `${e.id}\u0000${Tl(e)}`).join(""))}`;
	if (El.has(n)) return El.get(n);
	let r = e.map((e) => {
		let t = bl(Tl(e)), n = /* @__PURE__ */ new Map();
		for (let e of t) n.set(e, (n.get(e) || 0) + 1);
		return {
			memory: e,
			tf: n,
			length: t.length
		};
	}), i = /* @__PURE__ */ new Map();
	for (let e of r) for (let t of e.tf.keys()) i.set(t, (i.get(t) || 0) + 1);
	let a = {
		docs: r,
		df: i,
		average: r.reduce((e, t) => e + t.length, 0) / Math.max(1, r.length)
	};
	return El.set(n, a), El.size > 3 && El.delete(El.keys().next().value), a;
}
function Ol(e, t = e.map((e) => e.relevanceScore ?? e.score), { absolute: n = !1, useImportance: r = !0 } = {}) {
	let i = Math.min(...t), a = Math.max(...t);
	return e.map((e, o) => {
		let s = a === i ? +(a > 0) : i >= 0 ? t[o] / Math.max(a, 2 ** -52) : (t[o] - i) / (a - i), c = n ? Math.max(0, Math.min(1, t[o])) : Math.min(s, e.evidenceRelevance ?? 1), l = ((e.memory.importance || 3) - 1) / 4;
		return {
			...e,
			relevanceScore: t[o],
			relevance: c,
			importanceWeight: r ? l : 0,
			score: r ? .95 * c + .05 * l : c
		};
	}).sort((e, t) => t.score - e.score || e.memory.id.localeCompare(t.memory.id));
}
var kl = (e, t) => {
	if (!e || !t || e.length !== t.length) return 0;
	let n = 0, r = 0, i = 0;
	for (let a = 0; a < e.length; a++) n += e[a] * t[a], r += e[a] ** 2, i += t[a] ** 2;
	return r && i ? n / Math.sqrt(r * i) : 0;
};
function Al(e, t = null, { includePermanent: n = !1 } = {}) {
	let r = e.filter((e) => wl(e) && (n || !e.permanent)), i = Dl(r, t);
	return (e, { vectors: t = /* @__PURE__ */ new Map(), queryVector: n = null, excludeId: a = null, useImportance: o = !0 } = {}) => {
		let s = bl(e), c = i.docs.filter((e) => e.memory.id !== a).map((t) => {
			let n = s.filter((e) => t.tf.has(e)), a = Cl(t.memory.content) && e.toLowerCase().includes(Cl(t.memory.content).toLowerCase()), o = n.reduce((e, n) => {
				let a = t.tf.get(n), o = i.df.get(n);
				return e + Math.log(1 + (r.length - o + .5) / (o + .5)) * a * 2.2 / (a + 1.2 * (.25 + .75 * t.length / Math.max(1, i.average)));
			}, 0) + (a ? 2 : 0);
			return {
				memory: t.memory,
				score: o,
				evidenceRelevance: o / (o + .5),
				hits: n,
				source: a ? "exact" : "lexical"
			};
		}).sort((e, t) => t.score - e.score || e.memory.id.localeCompare(t.memory.id)).slice(0, 30), l = n ? r.filter((e) => e.id !== a && t.has(e.id)).map((e) => {
			let r = kl(n, t.get(e.id));
			return {
				memory: e,
				score: r,
				evidenceRelevance: Math.max(0, Math.min(1, r)),
				hits: [],
				source: "vector"
			};
		}).sort((e, t) => t.score - e.score || e.memory.id.localeCompare(t.memory.id)).slice(0, 30) : [], u = /* @__PURE__ */ new Map();
		for (let [e, t] of [["lexical", c], ["vector", l]]) t.forEach((t, n) => {
			let r = u.get(t.memory.id) || {
				...t,
				score: 0,
				evidenceRelevance: 0,
				channels: []
			};
			r.score += 1 / (60 + n + 1), r.evidenceRelevance = Math.max(r.evidenceRelevance, t.evidenceRelevance), r.channels.push(e), u.set(t.memory.id, r);
		});
		return Ol([...u.values()], void 0, { useImportance: o });
	};
}
// semantic.js
var jl = "scene_diary_vectors_v1", Ml = "vectors", Nl = () => new Promise((e, t) => {
	let n = indexedDB.open(jl, 1);
	n.onupgradeneeded = () => n.result.createObjectStore(Ml), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
}), Pl = (e, t, n) => [
	"content-only-v1",
	e.account,
	e.chat,
	e.space,
	t.endpoint,
	t.model,
	t.dimensions || "",
	n.id,
	al(Tl(n))
].join("|");
function Fl(e, t = "向量") {
	let n;
	try {
		n = new URL(e);
	} catch {
		throw Error(`${t}接口地址无效`);
	}
	if (!["http:", "https:"].includes(n.protocol)) throw Error(`${t}接口须为 HTTP(S) 地址`);
	if (n.username || n.password || [...n.searchParams.keys()].some((e) => /key|secret|token|password|auth/i.test(e))) throw Error(`请不要把密钥放在${t}接口地址中`);
	return n.href;
}
function Il(e, t = []) {
	let n = [], r = /* @__PURE__ */ new Set();
	for (let t = e; t && !r.has(t) && r.size < 3; t = t.cause) {
		r.add(t);
		let e = typeof t == "string" ? t : t.message || t.error?.message || t.code || t.name || "未知错误";
		n.push(`${t.name && t.name !== "Error" ? `${t.name}: ` : ""}${e}`);
	}
	let i = n.join("；原因：") || "未知错误";
	for (let e of t.filter(Boolean)) i = i.split(e).join("[已隐藏]");
	return i.replace(/Bearer\s+[^\s"']+/gi, "Bearer [已隐藏]").replace(/((?:api[_-]?key|token|secret|password|authorization)["']?\s*[:=]\s*["']?)[^\s"'&,}]+/gi, "$1[已隐藏]").slice(0, 1200);
}
async function Ll(e, t, n) {
	if (!e.ok) {
		let r;
		try {
			r = typeof e.text == "function" ? await e.text() : await e.json();
		} catch {}
		if (typeof r == "string") try {
			r = JSON.parse(r);
		} catch {
			r = { message: r };
		}
		let i = r?.error?.message || r?.message || (typeof r?.error == "string" ? r.error : ""), a = r?.error?.code || r?.code;
		throw Error(Il(`${t}服务返回 HTTP ${e.status}${a ? `（${a}）` : ""}${i ? `：${i}` : ""}`, [n]));
	}
	try {
		return await e.json();
	} catch (e) {
		throw e?.name === "AbortError" ? e : Error(`${t}响应不是有效 JSON：${Il(e, [n])}`);
	}
}
async function Rl(e, t, n, r, { signal: i } = {}) {
	let a = Fl(n.rerankEndpoint, "重排");
	if (!n.rerankModel) throw Error("未设置重排模型");
	if (!t.length) return [];
	let o = (await Ll(await fetch(a, {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "application/json",
			...r ? { Authorization: `Bearer ${r}` } : {}
		},
		body: JSON.stringify({
			model: n.rerankModel,
			query: e,
			documents: t,
			top_n: t.length
		}),
		signal: i
	}), "重排", r))?.results;
	if (!Array.isArray(o)) throw Error("重排服务返回的数据无效：缺少 results 数组");
	if (o.length !== t.length) throw Error(`重排服务返回的数据无效：提交 ${t.length} 条，返回 ${o.length} 条`);
	if (o.some((e) => !Number.isInteger(e?.index) || e.index < 0 || e.index >= t.length)) throw Error("重排服务返回的数据无效：结果索引缺失或越界");
	if (new Set(o.map((e) => e.index)).size !== o.length) throw Error("重排服务返回的数据无效：结果索引重复");
	if (o.some((e) => !Number.isFinite(e.relevance_score))) throw Error("重排服务返回的数据无效：相关性分数不是有限数值");
	return o.slice().sort((e, t) => e.index - t.index).map((e) => e.relevance_score);
}
async function zl(e, t, n, { signal: r } = {}) {
	let i = Fl(t.endpoint);
	if (!t.model) throw Error("未设置向量模型");
	let a = await Ll(await fetch(i, {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "application/json",
			...n ? { Authorization: `Bearer ${n}` } : {}
		},
		body: JSON.stringify({
			model: t.model,
			input: e,
			...t.dimensions ? { dimensions: t.dimensions } : {}
		}),
		signal: r
	}), "向量", n);
	if (!Array.isArray(a?.data) || a.data.length !== e.length || a.data.some((t) => !Number.isInteger(t.index) || t.index < 0 || t.index >= e.length) || new Set(a.data.map((e) => e.index)).size !== e.length) throw Error("向量结果索引无效");
	let o = a.data.slice().sort((e, t) => e.index - t.index).map((e) => e.embedding);
	if (o.some((e) => !Array.isArray(e) || !e.length || e.some((e) => !Number.isFinite(e)))) throw Error("向量服务返回的数据无效");
	let s = o[0]?.length;
	if (o.some((e) => e.length !== s) || t.dimensions && s !== t.dimensions) throw Error("向量维度不匹配");
	return o;
}
async function Bl(e, t, n) {
	if (!e.length) return /* @__PURE__ */ new Map();
	let r = await Nl();
	try {
		let i = r.transaction(Ml).objectStore(Ml), a = await Promise.all(e.map((e) => new Promise((r, a) => {
			let o = i.get(Pl(t, n, e));
			o.onsuccess = () => r([e.id, o.result]), o.onerror = () => a(o.error);
		})));
		return new Map(a.filter(([, e]) => Array.isArray(e)));
	} finally {
		r.close();
	}
}
async function Vl(e, t, n, r) {
	let i = await Nl();
	try {
		await new Promise((a, o) => {
			let s = i.transaction(Ml, "readwrite"), c = s.objectStore(Ml);
			s.oncomplete = a, s.onerror = s.onabort = () => o(s.error || /* @__PURE__ */ Error("向量缓存写入中止")), e.forEach((e, i) => c.put(t[i], Pl(n, r, e)));
		});
	} finally {
		i.close();
	}
}
// src/workspace.ts
function Hl(e) {
	let t = /* @__PURE__ */ sn(e.snapshot()), n = /* @__PURE__ */ L(!1), r = /* @__PURE__ */ L(!1), i = /* @__PURE__ */ L("workbench"), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = t.value.chatId;
	e.subscribe((e) => {
		t.value = e, un(t), e.chatId !== s && (s = e.chatId, i.value = "workbench", a.value = "", o.value = "");
	});
	async function c(n) {
		a.value = "", o.value = "";
		let r = s;
		try {
			return await n();
		} catch (n) {
			if (r === s && n?.name !== "AbortError" && !t.value.saveError) {
				let r = t.value.channels.map((e) => e.key), i = e.getContext().accountStorage;
				a.value = Il(n, [
					...r,
					i?.getItem("scene_diary_embedding_key"),
					i?.getItem("scene_diary_rerank_key")
				]);
			}
		}
	}
	return {
		host: e,
		view: t,
		opened: n,
		hasToolbar: r,
		page: i,
		error: a,
		notice: o,
		run: c,
		openWorkbench: () => {
			i.value = "workbench", n.value = !0, Gn(() => document.getElementById("sd-title")?.focus());
		},
		select: (e) => {
			i.value = e, a.value = "", o.value = "";
		}
	};
}
var Ul = Symbol("scene-diary"), Wl = () => Rr(Ul);
function Gl(e, t) {
	let n = URL.createObjectURL(new Blob([JSON.stringify(e, null, 2)], { type: "application/json" })), r = document.createElement("a");
	r.href = n, r.download = t, r.click(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
var Kl = {
	preference: "偏好",
	npc_relationship: "NPC 关系",
	item: "重要物品",
	place: "地点"
}, ql = {
	stored_at: {
		label: "存放于",
		meaning: "物品 → 明确存放该物品的地点事实",
		reverse: !0
	},
	part_of: {
		label: "属于／组成于",
		meaning: "组成部分 → 所属整体或范围",
		reverse: !0
	},
	used_for: {
		label: "用于",
		meaning: "物品或地点 → 明确用途涉及的事实",
		reverse: !1
	},
	depends_on: {
		label: "依赖",
		meaning: "受条件约束的事实 → 明确的条件",
		reverse: !1
	},
	causes: {
		label: "导致",
		meaning: "直接原因 → 明确结果",
		reverse: !1
	}
}, Jl = {
	diary: "日记",
	growth: "成长",
	memory: "事实提取",
	summary: "日记摘要",
	graph: "图谱整理"
}, Yl = [
	"diary",
	"memory",
	"growth"
], Xl = (e) => !!e && !e.deletedAt && Object.hasOwn(Kl, e.category) && !e.needsClassification, $ = (e) => typeof e == "string" ? e.trim() : "";
function Zl(e) {
	return {
		...Qc(e),
		category: e.category,
		needsClassification: !Object.hasOwn(Kl, e.category)
	};
}
function Ql(e) {
	return {
		id: e.id || Vc("diary"),
		title: $(e.title) || "未命名日记",
		body: typeof e.body == "string" ? e.body : "",
		summary: $(e.summary),
		summaryPending: !!e.summaryPending || !$(e.summary),
		needsReview: !!e.needsReview,
		createdAt: Number(e.createdAt) || Date.now(),
		updatedAt: Number(e.updatedAt) || Date.now()
	};
}
function $l(e = {}) {
	let { diaryConnectionProfile: t, memoryConnectionProfile: n, maintenanceConnectionProfile: r, maxGrowthChars: i, ...a } = e, o = (e, t) => e != null && e !== "" && Number.isFinite(+e) ? Math.max(0, Math.trunc(+e)) : t;
	return {
		...a,
		bindings: { ...a.bindings },
		recentDiaryBudget: a.recentDiaryBudget == null || a.recentDiaryBudget === "" ? null : o(a.recentDiaryBudget, null),
		historyBudget: o(a.historyBudget, 600),
		memoryTokenBudget: o(a.memoryTokenBudget, 1200),
		growthEnabled: a.growthEnabled !== !1
	};
}
function eu() {
	return {
		...tu(Kc()),
		connectionSetupNeeded: !1
	};
}
function tu(e) {
	if (e.version === 7) return e;
	let t = nl(e), { memoryLinks: n, memoryOrganization: r, maintenanceTransaction: i, ...a } = t, o = t.acts.filter((e) => $(e.diary)).map((e) => Ql({
		title: e.title,
		body: e.diary,
		needsReview: e.dirty,
		createdAt: e.closedAt || e.createdAt,
		updatedAt: e.closedAt || e.createdAt
	})), s = t.acts.map(({ diary: e, title: t, edited: n, dirty: r, revision: i, ...a }) => a), c = t.pendingTransaction, l = null;
	if (c) {
		let e = c.results || {}, t = e.diary?.value, n = e.growth?.value, r = e.memory?.value?.candidates ?? e.memory?.value ?? c.memoryCandidates;
		l = {
			...c,
			results: {
				diary: t?.diary ? {
					status: "draft",
					value: {
						title: t.title,
						body: t.diary,
						summary: ""
					}
				} : { status: "idle" },
				growth: typeof n == "string" && n ? {
					status: "outdated",
					value: {
						changed: !0,
						content: n
					}
				} : { status: "idle" },
				memory: Array.isArray(r) ? {
					status: "draft",
					value: r.map((e) => ({
						id: e.id || Vc("proposal"),
						action: "new",
						targetId: null,
						value: Zl(e),
						accepted: !1
					}))
				} : { status: "idle" }
			}
		}, delete l.memoryCandidates, delete l.memoryRejected;
	}
	return {
		...a,
		version: 7,
		acts: s,
		diaries: o,
		memories: t.memories.map(Zl),
		edges: [],
		graphReviewed: {},
		graphPreview: null,
		pendingTransaction: l,
		status: l ? "preview" : t.status === "pending_next_act" ? t.status : "active",
		settings: $l({
			...t.settings,
			prompts: {
				...t.settings.prompts,
				growth: t.settings.prompts.growth === "你是 {{char}} 的角色成长与恋爱关系发展整理器。根据 [当前角色成长] 和 [本幕对话]，重写截至本幕结束的完整角色成长记录。重点维护 {{char}} 的性格成长、情感变化、生活状态变化，以及 {{char}} 与 {{user}} 从相识至今的关系发展路径。说明重要经历如何影响角色及双方关系，但不要逐条复述剧情，不要补写未发生或未确认的变化，也不要假定下一幕与本幕在时间、地点或事件上连续。" ? "保持人物当前状态和长期连续性，仅采纳已确认的实质变化。" : t.settings.prompts.growth,
				memory: t.settings.prompts.memory === "你是恋爱陪伴记忆提取器。只依据 [本幕对话] 提取已发生或已明确确认的事实。承诺已经作出可以记录，但承诺内容未发生时不得写成已经完成。不要补写事实。" ? "抽取对未来对话有直接价值的客观事实。" : t.settings.prompts.memory,
				maintenance: t.settings.prompts.maintenance === "你是记忆库语义整理器。素材只有提供的已保存记忆及关联，不读取或补写外部事实。寻找同一事实的重复表达并建议合并；不同时间分别成立、发展、兑现、取消的事实保持独立并建议关联。仅人物或地点相同不足以关联。所有结果只是供用户批准的建议。" ? "寻找两条事实之间有依据且对召回有用的语义关系。" : t.settings.prompts.maintenance
			}
		}),
		connectionSetupNeeded: !0
	};
}
function nu(e, t, { actId: n = e.characterGrowth.lastIncludedActId, edited: r = !0 } = {}) {
	let i = Hc();
	e.characterGrowth = {
		...e.characterGrowth,
		content: $(t),
		edited: r,
		lastIncludedActId: n,
		createdAt: e.characterGrowth.createdAt || i.timestamp,
		updatedAt: i.timestamp,
		timezoneOffset: i.timezoneOffset,
		revision: e.characterGrowth.revision + 1,
		reviewRecommended: !1
	};
}
function ru(e) {
	return JSON.stringify([
		e.from,
		e.type,
		e.to
	]);
}
function iu(e, t) {
	let n = new Set(t.filter(Xl).map((e) => e.id)), r = /* @__PURE__ */ new Map();
	for (let t of e || []) t && n.has(t.from) && n.has(t.to) && t.from !== t.to && Object.hasOwn(ql, t.type) && $(t.reason) && r.set(ru(t), {
		from: t.from,
		to: t.to,
		type: t.type,
		reason: $(t.reason)
	});
	return [...r.values()];
}
function au(e) {
	return Xl(e) && $(e.title) && $(e.content) && Number.isInteger(e.importance) && e.importance >= 1 && e.importance <= 5;
}
function ou(e, t, n = null) {
	let r = e.memories.find((e) => e.id === n);
	if (n && !r) throw Error("事实已删除，请重新选择。");
	if (r?.locked) throw Error("请先解锁这条事实。");
	let i = Zl({
		...r,
		...t,
		id: r?.id || Vc("fact"),
		updatedAt: Date.now()
	});
	if (!au(i)) throw Error("请选择类别，填写标题与正文，并设置 1–5 的重要度。");
	return r ? e.memories[e.memories.indexOf(r)] = i : e.memories.push(i), e.memoryRevision++, i;
}
function su(e, t) {
	if (e.memories.find((e) => e.id === t)?.locked) throw Error("请先解锁这条事实。");
	e.memories = e.memories.filter((e) => e.id !== t), e.edges = iu(e.edges, e.memories), delete e.graphReviewed[t], e.memoryRevision++;
}
function cu(e, t, n, r) {
	let i = e.memories.find((e) => e.id === t), a = [...new Set(n)].filter((e) => e !== t).map((t) => e.memories.find((e) => e.id === t));
	if (!Xl(i) || !a.length || a.some((e) => !Xl(e) || e.locked) || i.locked) throw Error("请选择有效且已解锁的事实。");
	let o = [i, ...a], s = [...new Set(o.map((e) => e.storyTime).filter(Boolean))];
	if (s.length > 1) throw Error("故事时间不同，请先在事实编辑器中核对。");
	ou(e, {
		content: r,
		permanent: o.some((e) => e.permanent),
		importance: Math.max(...o.map((e) => e.importance)),
		storyTime: s[0] || null,
		people: o.flatMap((e) => e.people),
		aliases: o.flatMap((e) => e.aliases)
	}, t);
	let c = new Set(a.map((e) => e.id));
	e.memories = e.memories.filter((e) => !c.has(e.id)), e.edges = iu(e.edges.map((e) => ({
		...e,
		from: c.has(e.from) ? t : e.from,
		to: c.has(e.to) ? t : e.to
	})), e.memories);
	for (let t of c) delete e.graphReviewed[t];
}
function lu(e, t) {
	return {
		format: "scene-diary-content",
		version: 3,
		chatId: String(t),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		diaries: structuredClone(e.diaries),
		characterGrowth: structuredClone(e.characterGrowth),
		memories: structuredClone(e.memories),
		edges: structuredClone(e.edges)
	};
}
function uu(e, t, n) {
	if (t?.format !== "scene-diary-content" || ![2, 3].includes(t.version) || String(n) !== t.chatId) throw Error("备份格式、版本或聊天身份不匹配。");
	if (!Array.isArray(t.diaries) || !Array.isArray(t.memories) || typeof t.characterGrowth?.content != "string") throw Error("备份缺少必需字段。");
	let r = t.version === 2, i = (e) => e.every((e) => typeof e == "string" && e) && new Set(e).size === e.length;
	if (!i(t.diaries.map((e) => r ? Number.isInteger(e?.actId) ? String(e.actId) : "" : e?.id)) || !t.diaries.every((e) => $(r ? e?.diary : e?.body) && (r || typeof e.summary == "string")) || !i(t.memories.map((e) => e?.id)) || !t.memories.every((e) => $(e?.category) && $(e?.title) && $(e?.content))) throw Error("备份包含重复 ID 或无效条目。");
	let a = t.memories.map(Zl), o = new Map(e.acts.map((e) => [e.id, e.closedAt || e.createdAt])), s = Date.parse(t.createdAt) || Date.now(), c = t.diaries.map((e, t) => Ql(r ? {
		title: e.title,
		body: e.diary,
		needsReview: e.dirty,
		createdAt: o.get(e.actId) || s + t
	} : e)), l = r ? [] : iu(t.edges, a);
	if (!r && (!Array.isArray(t.edges) || l.length !== t.edges.length)) throw Error("备份中的图谱关系无效。");
	return {
		...e,
		diaries: c,
		memories: a,
		edges: l,
		graphReviewed: {},
		graphPreview: null,
		memoryRevision: e.memoryRevision + 1,
		characterGrowth: {
			...e.characterGrowth,
			...t.characterGrowth,
			revision: e.characterGrowth.revision + 1
		}
	};
}
// src/TextField.vue?vue&type=script&setup=true&lang.ts
var du = { class: "sd-field" }, fu = ["rows", "readonly"], pu = /* @__PURE__ */ $r({
	__name: "TextField",
	props: /*@__PURE__*/ Bi({
		label: {},
		rows: {},
		readonly: { type: Boolean }
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = sa(e, "modelValue");
		return (n, r) => (U(), W("label", du, [G("span", null, M(e.label), 1), B(G("textarea", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			rows: e.rows || 6,
			readonly: e.readonly
		}, null, 8, fu), [[Z, t.value]])]));
	}
}), mu = { class: "sd-card sd-stack" }, hu = { class: "sd-section-title" }, gu = { class: "sd-pill" }, _u = {
	key: 0,
	class: "sd-alert"
}, vu = { key: 1 }, yu = { key: 2 }, bu = { class: "sd-field" }, xu = {
	key: 0,
	class: "sd-compare"
}, Su = { class: "sd-field" }, Cu = ["value"], wu = { key: 0 }, Tu = { class: "sd-stack" }, Eu = { key: 0 }, Du = { key: 1 }, Ou = ["onUpdate:modelValue", "disabled"], ku = { key: 0 }, Au = { class: "sd-field" }, ju = ["onUpdate:modelValue"], Mu = ["value"], Nu = { class: "sd-field" }, Pu = ["onUpdate:modelValue"], Fu = { class: "sd-form-grid" }, Iu = { class: "sd-field" }, Lu = ["onUpdate:modelValue"], Ru = { class: "sd-field" }, zu = ["onUpdate:modelValue"], Bu = {
	key: 4,
	class: "sd-actions"
}, Vu = {
	key: 5,
	class: "sd-actions"
}, Hu = /* @__PURE__ */ $r({
	__name: "Review",
	props: {
		kind: {},
		part: {},
		transaction: {}
	},
	setup(e) {
		let t = e, { view: n, host: r, run: i, select: a } = Wl(), o = /* @__PURE__ */ L(), s = () => t.kind === "diary" ? {
			title: "",
			body: "",
			summary: ""
		} : t.kind === "growth" ? {
			changed: !0,
			content: ""
		} : [];
		Hr(() => JSON.stringify(t.part.value), () => {
			o.value = t.part.value ? JSON.parse(JSON.stringify(t.part.value)) : s();
		}, { immediate: !0 });
		let c = {
			idle: "待生成",
			running: "生成中",
			error: "可重试",
			draft: "待确认",
			confirmed: "已确认",
			skipped: "已跳过",
			outdated: "需重新评估"
		}, l = {
			new: "新增",
			duplicate: "重复",
			supplement: "补充",
			update: "状态变化"
		}, u = X(() => t.kind !== "growth" || t.transaction.results.diary.status === "confirmed"), d = X(() => n.value.busy.includes("close:" + t.kind)), f = X(() => n.value.channels.some((e) => e.id === n.value.state?.settings.bindings[t.kind])), p = (e) => n.value.state?.memories.find((t) => t.id === e);
		function m(e = !1, n = !0) {
			return i(() => r.reviewPart(t.kind, JSON.parse(JSON.stringify(o.value)), e, n));
		}
		return (t, s) => (U(), W("article", mu, [
			G("header", hu, [G("h3", null, M(R(Jl)[e.kind]), 1), G("span", gu, M(c[e.part.status]), 1)]),
			e.part.error ? (U(), W("p", _u, M(e.part.error), 1)) : J("", !0),
			e.kind === "growth" && !u.value && e.part.status !== "skipped" ? (U(), W("p", vu, "确认日记后开始成长评估。")) : J("", !0),
			e.kind === "growth" && e.part.status === "outdated" ? (U(), W("p", yu, "日记内容已变更。可参考旧草稿，重新评估或修订后确认。")) : J("", !0),
			u.value && !d.value ? (U(), W(H, { key: 3 }, [e.kind === "diary" ? (U(), W(H, { key: 0 }, [
				G("label", bu, [s[11] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": s[0] ||= (e) => o.value.title = e }, null, 512), [[Z, o.value.title]])]),
				K(pu, {
					modelValue: o.value.body,
					"onUpdate:modelValue": s[1] ||= (e) => o.value.body = e,
					label: "第一人称正文",
					rows: 9
				}, null, 8, ["modelValue"]),
				K(pu, {
					modelValue: o.value.summary,
					"onUpdate:modelValue": s[2] ||= (e) => o.value.summary = e,
					label: "单篇摘要",
					rows: 4
				}, null, 8, ["modelValue"])
			], 64)) : e.kind === "growth" ? (U(), W(H, { key: 1 }, [G("label", null, [B(G("input", {
				type: "checkbox",
				"onUpdate:modelValue": s[3] ||= (e) => o.value.changed = e
			}, null, 512), [[hc, o.value.changed]]), s[12] ||= q(" 本幕有实质变化", -1)]), o.value.changed ? (U(), W("div", xu, [G("label", Su, [s[13] ||= q("当前画像", -1), G("textarea", {
				value: R(n).state?.characterGrowth.content,
				readonly: "",
				rows: "8"
			}, null, 8, Cu)]), K(pu, {
				modelValue: o.value.content,
				"onUpdate:modelValue": s[4] ||= (e) => o.value.content = e,
				label: "候选画像",
				rows: 8
			}, null, 8, ["modelValue"])])) : J("", !0)], 64)) : (U(), W(H, { key: 2 }, [e.part.value && !o.value.length ? (U(), W("p", wu, "本幕没有合格事实。")) : J("", !0), (U(!0), W(H, null, V(o.value, (e) => (U(), W("details", {
				class: "sd-subcard",
				key: e.id,
				open: ""
			}, [G("summary", null, M(l[e.action]) + " · " + M(e.value.title), 1), G("div", Tu, [
				p(e.targetId) ? (U(), W("p", Eu, [
					s[14] ||= G("strong", null, "已有事实", -1),
					s[15] ||= G("br", null, null, -1),
					q(M(p(e.targetId).content), 1)
				])) : J("", !0),
				e.action === "duplicate" ? J("", !0) : (U(), W("label", Du, [
					B(G("input", {
						type: "checkbox",
						"onUpdate:modelValue": (t) => e.accepted = t,
						disabled: p(e.targetId)?.locked
					}, null, 8, Ou), [[hc, e.accepted]]),
					s[16] ||= q(" 接受这条建议", -1),
					p(e.targetId)?.locked ? (U(), W("span", ku, "（目标已锁定）")) : J("", !0)
				])),
				G("label", Au, [s[18] ||= q("类别", -1), B(G("select", { "onUpdate:modelValue": (t) => e.value.category = t }, [s[17] ||= G("option", {
					disabled: "",
					value: ""
				}, "请选择", -1), (U(!0), W(H, null, V(R(Kl), (e, t) => (U(), W("option", {
					key: t,
					value: t
				}, M(e), 9, Mu))), 128))], 8, ju), [[_c, e.value.category]])]),
				G("label", Nu, [s[19] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": (t) => e.value.title = t }, null, 8, Pu), [[Z, e.value.title]])]),
				K(pu, {
					modelValue: e.value.content,
					"onUpdate:modelValue": (t) => e.value.content = t,
					label: "拟保存内容",
					rows: 3
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				G("div", Fu, [G("label", Iu, [s[20] ||= q("故事时间", -1), B(G("input", { "onUpdate:modelValue": (t) => e.value.storyTime = t }, null, 8, Lu), [[Z, e.value.storyTime]])]), G("label", Ru, [s[21] ||= q("重要度", -1), B(G("input", {
					type: "number",
					"onUpdate:modelValue": (t) => e.value.importance = t,
					min: "1",
					max: "5"
				}, null, 8, zu), [[
					Z,
					e.value.importance,
					void 0,
					{ number: !0 }
				]])])])
			])]))), 128))], 64))], 64)) : J("", !0),
			d.value ? (U(), W("div", Bu, [G("button", { onClick: s[5] ||= (t) => R(r).cancel("close:" + e.kind) }, "取消本项请求")])) : u.value ? (U(), W("div", Vu, [
				f.value ? (U(), W("button", {
					key: 0,
					onClick: s[6] ||= (t) => R(i)(() => R(r).runClose(e.kind))
				}, M(e.part.status === "idle" ? "生成" : "重新生成"), 1)) : (U(), W("button", {
					key: 1,
					onClick: s[7] ||= (e) => R(a)("settings")
				}, "配置渠道")),
				e.kind !== "memory" || e.part.value ? (U(), W("button", {
					key: 2,
					onClick: s[8] ||= (e) => m(!1, !1)
				}, "保存草稿")) : J("", !0),
				e.kind !== "memory" || e.part.value ? (U(), W("button", {
					key: 3,
					class: "sd-primary",
					onClick: s[9] ||= (e) => m()
				}, "确认" + M(R(Jl)[e.kind]), 1)) : J("", !0),
				G("button", { onClick: s[10] ||= (e) => m(!0) }, M(e.kind === "diary" ? "跳过日记和成长评估" : "跳过本项"), 1)
			])) : J("", !0)
		]));
	}
}), Uu = {
	key: 0,
	class: "sd-card sd-stack"
}, Wu = ["max"], Gu = { class: "sd-hero sd-card" }, Ku = { class: "sd-kicker" }, qu = { key: 0 }, Ju = { key: 1 }, Yu = { key: 0 }, Xu = ["disabled"], Zu = {
	key: 0,
	class: "sd-status"
}, Qu = {
	key: 1,
	id: "sd-close-review",
	class: "sd-stack"
}, $u = { class: "sd-sticky sd-actions" }, ed = ["disabled"], td = { class: "sd-card" }, nd = { class: "sd-actions" }, rd = { class: "sd-file" }, id = /* @__PURE__ */ $r({
	__name: "Workbench",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = Wl(), a = /* @__PURE__ */ L(1), o = X(() => t.value.state), s = X(() => rl(o.value)), c = X(() => o.value?.pendingTransaction), l = X(() => Yl.every((e) => ["confirmed", "skipped"].includes(c.value?.results[e]?.status))), u = () => document.getElementById("sd-close-review")?.scrollIntoView({ block: "start" }), d = (e) => window.confirm(e), f = (e) => t.value.channels.some((t) => t.id === o.value?.settings.bindings[e]);
		return (e, p) => o.value ? (U(), W(H, { key: 1 }, [
			G("header", Gu, [G("div", null, [
				G("p", Ku, "第 " + M(s.value?.id) + " 幕", 1),
				G("h3", null, M(c.value ? "本幕待审核" : o.value.status === "pending_next_act" ? "本幕已归档" : "当前幕"), 1),
				G("p", null, [
					q(M(s.value?.messageIds.length || 0) + " 条归幕对话", 1),
					s.value?.startMessageIndex == null ? J("", !0) : (U(), W("span", qu, " · 起始楼层 " + M(s.value.startMessageIndex + 1), 1)),
					s.value?.endMessageIndex == null ? J("", !0) : (U(), W("span", Ju, " · 结束楼层 " + M(s.value.endMessageIndex + 1), 1))
				]),
				o.value.status === "pending_next_act" ? (U(), W("p", Yu, "下一条玩家消息将开启新幕。")) : J("", !0)
			]), !c.value && o.value.status === "active" ? (U(), W("button", {
				key: 0,
				class: "sd-primary",
				disabled: !s.value?.messageIds.length,
				onClick: p[3] ||= (e) => R(r)(R(n).openClose)
			}, "结束这一幕", 8, Xu)) : c.value ? (U(), W("button", {
				key: 1,
				class: "sd-primary",
				onClick: u
			}, "继续审核")) : (U(), W("button", {
				key: 2,
				onClick: p[4] ||= (e) => R(i)("diaries")
			}, "查看日记档案"))]),
			o.value.connectionSetupNeeded && [
				"diary",
				"memory",
				"growth",
				"summary",
				"graph"
			].some((e) => !f(e)) ? (U(), W("p", Zu, [p[13] ||= q(" 旧版连接已停用。请为尚未绑定的日记、成长、事实提取、日记摘要和图谱任务配置自建渠道。 ", -1), G("button", { onClick: p[5] ||= (e) => R(i)("settings") }, "打开设置")])) : J("", !0),
			c.value ? (U(), W("section", Qu, [(U(!0), W(H, null, V(R(Yl), (e) => (U(), ko(Hu, {
				key: c.value.id + e,
				kind: e,
				part: c.value.results[e],
				transaction: c.value
			}, null, 8, [
				"kind",
				"part",
				"transaction"
			]))), 128)), G("div", $u, [G("button", { onClick: p[6] ||= (e) => R(r)(() => d("取消这次关幕并清除本次审核草稿？") && R(n).cancelClose()) }, "取消关幕"), G("button", {
				class: "sd-primary",
				disabled: !l.value,
				onClick: p[7] ||= (e) => R(r)(R(n).confirmClose)
			}, "确认结束本幕", 8, ed)])])) : J("", !0),
			G("details", td, [p[15] ||= G("summary", null, "备份与恢复", -1), G("div", nd, [
				G("button", { onClick: p[8] ||= (e) => R(r)(() => R(Gl)(R(n).backup(), "scene-diary-" + R(t).chatId + ".json")) }, "导出内容"),
				G("label", rd, [p[14] ||= q("导入内容 ", -1), G("input", {
					type: "file",
					accept: ".json,application/json",
					onChange: p[9] ||= (e) => R(r)(async () => {
						let t = e.target, r = t.files?.[0];
						if (t.value = "", !r) return;
						let i = JSON.parse(await r.text()), a = i.version === 2 ? "请保留原 v2 文件以便查阅旧关联。确认替换当前日记、成长与事实？" : "确认替换当前日记、成长、事实与图谱？";
						d(a) && await R(n).import(i);
					})
				}, null, 32)]),
				G("button", { onClick: p[10] ||= (e) => R(r)(async () => R(Gl)(await R(n).migrationBackup(), "scene-diary-pre-upgrade-" + R(t).chatId + ".json")) }, "导出升级前整聊天备份")
			])])
		], 64)) : (U(), W("div", Uu, [
			G("p", null, M(R(t).blocker), 1),
			R(t).blocker.startsWith("已有聊天") ? (U(), W("form", {
				key: 0,
				class: "sd-actions",
				onSubmit: p[1] ||= wc((e) => R(r)(() => R(n).takeOver(a.value - 1)), ["prevent"])
			}, [G("label", null, [p[11] ||= q("从楼层 ", -1), B(G("input", {
				"onUpdate:modelValue": p[0] ||= (e) => a.value = e,
				type: "number",
				min: "1",
				max: Math.max(R(t).messages, 1),
				required: ""
			}, null, 8, Wu), [[
				Z,
				a.value,
				void 0,
				{ number: !0 }
			]])]), p[12] ||= G("button", { class: "sd-primary" }, "接管聊天", -1)], 32)) : J("", !0),
			R(t).blocker.startsWith("迁移备份失败") ? (U(), W("button", {
				key: 1,
				onClick: p[2] ||= (e) => R(r)(R(n).initialize)
			}, "重试迁移")) : J("", !0)
		]));
	}
}), ad = {
	key: 0,
	class: "sd-card"
}, od = { class: "sd-card sd-stack" }, sd = {
	key: 0,
	class: "sd-status"
}, cd = { class: "sd-sticky sd-actions" }, ld = { class: "sd-card sd-stack" }, ud = {
	key: 0,
	role: "status"
}, dd = {
	key: 1,
	class: "sd-compare"
}, fd = { class: "sd-field" }, pd = ["value"], md = { class: "sd-actions" }, hd = /* @__PURE__ */ $r({
	__name: "Growth",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = Wl(), a = X(() => t.value.state?.characterGrowth), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L("");
		return Hr(() => a.value?.revision, () => o.value = a.value?.content || "", { immediate: !0 }), Hr(() => t.value.growthPreview, (e) => s.value = e?.content || "", { immediate: !0 }), (e, c) => a.value ? (U(), W(H, { key: 1 }, [G("section", od, [
			c[8] ||= G("header", { class: "sd-section-title" }, [G("h3", null, "当前角色画像")], -1),
			a.value.reviewRecommended ? (U(), W("p", sd, "历史材料有变更，可核对现画像或发起重整。")) : J("", !0),
			K(pu, {
				modelValue: o.value,
				"onUpdate:modelValue": c[0] ||= (e) => o.value = e,
				label: "人格、关系与当前状态",
				rows: 12
			}, null, 8, ["modelValue"]),
			G("div", cd, [G("button", {
				class: "sd-primary",
				onClick: c[1] ||= (e) => R(r)(() => R(n).mutate((e) => R(nu)(e, o.value)))
			}, "保存画像")])
		]), G("section", ld, [
			c[10] ||= G("header", { class: "sd-section-title" }, [G("h3", null, "全局成长重整")], -1),
			R(t).growthProgress ? (U(), W("p", ud, M(R(t).growthProgress), 1)) : J("", !0),
			R(t).growthPreview ? (U(), W("div", dd, [G("label", fd, [c[9] ||= q("现画像", -1), G("textarea", {
				value: a.value.content,
				rows: "10",
				readonly: ""
			}, null, 8, pd)]), K(pu, {
				modelValue: s.value,
				"onUpdate:modelValue": c[2] ||= (e) => s.value = e,
				label: "重整后画像",
				rows: 10
			}, null, 8, ["modelValue"])])) : J("", !0),
			G("div", md, [R(t).busy.includes("growth") ? (U(), W("button", {
				key: 0,
				onClick: c[3] ||= (e) => R(n).cancel("growth")
			}, "取消重整")) : R(t).growthPreview ? (U(), W(H, { key: 1 }, [G("button", { onClick: c[4] ||= (...e) => R(n).discardGrowth && R(n).discardGrowth(...e) }, "保留现稿"), G("button", {
				class: "sd-primary",
				onClick: c[5] ||= (e) => R(r)(() => R(n).acceptGrowth(s.value))
			}, "应用候选画像")], 64)) : R(t).channels.some((e) => e.id === R(t).state?.settings.bindings.growth) ? (U(), W("button", {
				key: 2,
				onClick: c[6] ||= (e) => R(r)(R(n).generateGrowth)
			}, "根据全部有效日记重整")) : (U(), W("button", {
				key: 3,
				onClick: c[7] ||= (e) => R(i)("settings")
			}, "配置成长渠道"))])
		])], 64)) : (U(), W("p", ad, M(R(t).blocker), 1));
	}
}), gd = { class: "sd-search" }, _d = ["aria-label", "placeholder"], vd = /* @__PURE__ */ $r({
	__name: "SearchField",
	props: /*@__PURE__*/ Bi({ label: {} }, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = sa(e, "modelValue");
		return (n, r) => (U(), W("label", gd, [r[1] ||= G("i", {
			class: "fa-solid fa-magnifying-glass",
			"aria-hidden": "true"
		}, null, -1), B(G("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			type: "search",
			"aria-label": e.label,
			placeholder: e.label
		}, null, 8, _d), [[Z, t.value]])]));
	}
}), yd = {
	key: 0,
	class: "sd-card"
}, bd = { class: "sd-card sd-stack" }, xd = { class: "sd-actions" }, Sd = {
	key: 0,
	role: "status"
}, Cd = {
	key: 0,
	class: "sd-card sd-stack"
}, wd = { class: "sd-section-title" }, Td = { class: "sd-field" }, Ed = { class: "sd-sticky sd-actions" }, Dd = {
	key: 1,
	class: "sd-card"
}, Od = { key: 0 }, kd = { key: 1 }, Ad = { class: "sd-snippet" }, jd = ["onClick"], Md = /* @__PURE__ */ $r({
	__name: "Diaries",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = Wl(), a = /* @__PURE__ */ L(""), o = X(() => t.value.state), s = /* @__PURE__ */ L(null), c = /* @__PURE__ */ L(null), l = X(() => [...o.value?.diaries || []].sort((e, t) => t.createdAt - e.createdAt)), u = X(() => l.value.filter((e) => e.summaryPending).map((e) => e.id)), d = X(() => l.value.filter((e) => (e.title + "\n" + e.body + "\n" + e.summary).toLowerCase().includes(a.value.trim().toLowerCase()))), f = X(() => l.value.find((e) => e.id === s.value));
		Hr(() => f.value?.updatedAt, () => {
			f.value && (c.value = { ...f.value });
		}, { immediate: !0 });
		function p(e = null) {
			s.value = e?.id || null, c.value = e ? { ...e } : Ql({
				body: "",
				summary: "",
				title: ""
			});
		}
		function m(e = !1) {
			return r(async () => {
				if (!$(c.value.body)) throw Error("请填写日记正文。");
				if (e && !$(c.value.summary)) throw Error("请先填写摘要。");
				let t = f.value, r = e ? !1 : t ? t.body !== c.value.body || t.summaryPending : !$(c.value.summary), i = Ql({
					...c.value,
					summaryPending: r,
					needsReview: !1,
					updatedAt: Date.now()
				});
				await n.mutate((e) => {
					let n = e.diaries.findIndex((e) => e.id === i.id);
					if (n < 0 && t) throw Error("该日记已删除。");
					n >= 0 ? e.diaries[n] = i : e.diaries.push(i), (!t || t.body !== i.body || t.needsReview) && (e.characterGrowth.reviewRecommended = !0);
				}), p(i);
			});
		}
		function h() {
			if (!f.value || !window.confirm("删除这篇日记及其摘要？")) return;
			let e = f.value.id;
			return r(async () => {
				await n.mutate((t) => {
					t.diaries = t.diaries.filter((t) => t.id !== e), t.characterGrowth.reviewRecommended = !0;
				}), c.value = null, s.value = null;
			});
		}
		return (e, l) => o.value ? (U(), W(H, { key: 1 }, [
			G("div", bd, [
				K(vd, {
					modelValue: a.value,
					"onUpdate:modelValue": l[0] ||= (e) => a.value = e,
					label: "搜索日记标题、正文与摘要"
				}, null, 8, ["modelValue"]),
				G("div", xd, [G("button", {
					class: "sd-primary",
					onClick: l[1] ||= (e) => p()
				}, "新建日记"), R(t).busy.includes("summary") ? (U(), W("button", {
					key: 0,
					onClick: l[2] ||= (e) => R(n).cancel("summary")
				}, "取消摘要任务")) : u.value.length && R(t).channels.some((e) => e.id === o.value.settings.bindings.summary) ? (U(), W("button", {
					key: 1,
					onClick: l[3] ||= (e) => R(r)(() => R(n).summarizeAll(u.value))
				}, "补全 " + M(u.value.length) + " 篇摘要", 1)) : u.value.length ? (U(), W("button", {
					key: 2,
					onClick: l[4] ||= (e) => R(i)("settings")
				}, "配置摘要渠道")) : J("", !0)]),
				R(t).summaryProgress ? (U(), W("p", Sd, M(R(t).summaryProgress), 1)) : J("", !0)
			]),
			c.value ? (U(), W("section", Cd, [
				G("header", wd, [G("h3", null, M(f.value ? "编辑日记" : "新建日记"), 1), G("button", { onClick: l[5] ||= (e) => {
					c.value = null, s.value = null;
				} }, "关闭编辑")]),
				G("label", Td, [l[12] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": l[6] ||= (e) => c.value.title = e }, null, 512), [[Z, c.value.title]])]),
				K(pu, {
					modelValue: c.value.body,
					"onUpdate:modelValue": l[7] ||= (e) => c.value.body = e,
					label: "正文",
					rows: 12
				}, null, 8, ["modelValue"]),
				K(pu, {
					modelValue: c.value.summary,
					"onUpdate:modelValue": l[8] ||= (e) => c.value.summary = e,
					label: f.value?.summaryPending ? "摘要 · 待核对" : "单篇摘要",
					rows: 5
				}, null, 8, ["modelValue", "label"]),
				G("div", Ed, [
					f.value ? (U(), W("button", {
						key: 0,
						class: "sd-danger",
						onClick: h
					}, "删除")) : J("", !0),
					f.value && !R(t).busy.includes("summary") ? (U(), W("button", {
						key: 1,
						onClick: l[9] ||= (e) => R(r)(() => R(n).summarizeAll([f.value.id]))
					}, "重生成摘要")) : J("", !0),
					G("button", { onClick: l[10] ||= (e) => m() }, "保存日记"),
					G("button", {
						class: "sd-primary",
						onClick: l[11] ||= (e) => m(!0)
					}, "保存并确认摘要")
				])
			])) : J("", !0),
			d.value.length ? J("", !0) : (U(), W("p", Dd, "没有符合条件的日记。")),
			(U(!0), W(H, null, V(d.value, (e) => (U(), W("article", {
				key: e.id,
				class: "sd-card sd-listrow"
			}, [G("div", null, [
				G("h3", null, M(e.title), 1),
				G("p", null, [
					q(M(new Date(e.createdAt).toLocaleDateString()), 1),
					e.summaryPending ? (U(), W("span", Od, " · 摘要待核对")) : J("", !0),
					e.needsReview ? (U(), W("span", kd, " · 日记待复核")) : J("", !0)
				]),
				G("p", Ad, M(e.summary || e.body), 1)
			]), G("button", { onClick: (t) => p(e) }, "查看与编辑", 8, jd)]))), 128))
		], 64)) : (U(), W("p", yd, M(R(t).blocker), 1));
	}
}), Nd = {
	key: 0,
	class: "sd-card"
}, Pd = {
	class: "sd-segments",
	"aria-label": "长期记忆视图"
}, Fd = ["aria-pressed"], Id = ["aria-pressed"], Ld = ["aria-pressed"], Rd = { class: "sd-card sd-stack" }, zd = { key: 0 }, Bd = {
	key: 1,
	class: "sd-actions"
}, Vd = {
	key: 0,
	class: "sd-card sd-stack"
}, Hd = { class: "sd-section-title" }, Ud = ["disabled"], Wd = { class: "sd-form-grid" }, Gd = { class: "sd-field" }, Kd = ["value"], qd = ["value"], Jd = { class: "sd-field" }, Yd = { class: "sd-field" }, Xd = { class: "sd-form-grid" }, Zd = { class: "sd-field" }, Qd = { class: "sd-field" }, $d = { class: "sd-field" }, ef = { class: "sd-sticky sd-actions" }, tf = ["disabled"], nf = {
	key: 1,
	class: "sd-card"
}, rf = { class: "sd-stack" }, af = { key: 0 }, of = { key: 1 }, sf = { class: "sd-actions" }, cf = ["onClick"], lf = ["onClick"], uf = { class: "sd-card sd-stack" }, df = { class: "sd-section-title" }, ff = { class: "sd-field" }, pf = ["value"], mf = {
	key: 0,
	class: "sd-graph"
}, hf = { class: "sd-node" }, gf = { class: "sd-branches" }, _f = { key: 0 }, vf = ["onClick"], yf = ["onClick"], bf = {
	key: 1,
	class: "sd-actions"
}, xf = {
	key: 2,
	class: "sd-subcard sd-stack"
}, Sf = { class: "sd-field" }, Cf = ["value"], wf = { key: 0 }, Tf = ["disabled"], Ef = {
	key: 3,
	class: "sd-subcard sd-stack"
}, Df = { class: "sd-form-grid" }, Of = { class: "sd-field" }, kf = ["value"], Af = { class: "sd-field" }, jf = ["value"], Mf = { class: "sd-field" }, Nf = ["value"], Pf = { class: "sd-actions" }, Ff = { class: "sd-card sd-stack" }, If = {
	key: 0,
	role: "status"
}, Lf = { class: "sd-actions" }, Rf = {
	key: 1,
	class: "sd-stack"
}, zf = ["onUpdate:modelValue"], Bf = { class: "sd-actions" }, Vf = /* @__PURE__ */ $r({
	__name: "Memory",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = Wl(), a = X(() => t.value.state), o = /* @__PURE__ */ L("facts"), s = /* @__PURE__ */ L(""), c = /* @__PURE__ */ L(null), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(null), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L([]), p = /* @__PURE__ */ L(!1), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(""), g = X(() => new Map((a.value?.memories || []).map((e) => [e.id, e]))), _ = X(() => (a.value?.memories || []).filter(Xl)), v = X(() => (a.value?.memories || []).filter((e) => !Xl(e))), y = X(() => (o.value === "pending" ? v.value : _.value).filter((e) => [
			e.title,
			e.content,
			...e.people,
			...e.aliases
		].join("\n").toLowerCase().includes(s.value.trim().toLowerCase()))), b = X(() => (a.value?.edges || []).filter((e) => e.from === l.value || e.to === l.value)), x = (e) => g.value.get(e)?.title || e;
		Hr(() => JSON.stringify(a.value?.graphPreview), () => {
			f.value = JSON.parse(JSON.stringify(a.value?.graphPreview?.edges || []));
		}, { immediate: !0 });
		function S(e = null) {
			c.value = e ? {
				...e,
				peopleText: e.people.join("、"),
				aliasesText: e.aliases.join("、")
			} : {
				title: "",
				category: "preference",
				content: "",
				importance: 3,
				storyTime: "",
				peopleText: "",
				aliasesText: "",
				permanent: !1
			};
		}
		function C() {
			return r(async () => {
				let { id: e, title: t, content: r, category: i, importance: a, storyTime: o, permanent: s, peopleText: l, aliasesText: u } = c.value, d = (e) => e.split(/[、，,\r\n]+/).map((e) => e.trim()).filter(Boolean);
				await n.mutate((n) => ou(n, {
					title: t,
					content: r,
					category: i,
					importance: a,
					storyTime: o,
					permanent: s,
					people: d(l),
					aliases: d(u)
				}, e)), c.value = null;
			});
		}
		function ee(e, t) {
			return r(() => n.mutate((n) => {
				let r = n.memories.find((t) => t.id === e.id);
				if (!r) throw Error("该事实已删除。");
				if (r.locked && t !== "locked") throw Error("请先解锁。");
				r[t] = !r[t], n.memoryRevision++, c.value?.id === e.id && (c.value[t] = r[t]);
			}));
		}
		function w() {
			if (!c.value || !window.confirm("删除此事实及其相关边？")) return;
			let e = c.value.id;
			return r(async () => {
				await n.mutate((t) => su(t, e)), c.value = null;
			});
		}
		function te(e = null) {
			u.value = e ? { ...e } : {
				from: l.value,
				to: "",
				type: "stored_at",
				reason: ""
			}, d.value = e ? ru(e) : "";
		}
		function T() {
			let e = { ...u.value };
			return r(async () => {
				await n.mutate((t) => {
					let n = t.edges.filter((e) => ru(e) !== d.value), r = iu([...n, e], t.memories);
					if (r.length !== n.length + 1) throw Error("请选择不同的事实、关系类型并填写依据，且避免重复关系。");
					t.edges = r;
				}), l.value = e.from, u.value = null;
			});
		}
		function E() {
			if (window.confirm("删除这条关系？")) return r(async () => {
				await n.mutate((e) => {
					e.edges = e.edges.filter((e) => ru(e) !== d.value);
				}), u.value = null;
			});
		}
		function ne() {
			if (window.confirm("将来源事实合并到选定事实，并重定向相关边？")) return r(async () => {
				await n.mutate((e) => cu(e, l.value, [m.value], h.value)), p.value = !1;
			});
		}
		return (e, D) => a.value ? (U(), W(H, { key: 1 }, [G("nav", Pd, [
			G("button", {
				"aria-pressed": o.value === "facts",
				onClick: D[0] ||= (e) => {
					o.value = "facts", c.value = null;
				}
			}, "事实表", 8, Fd),
			G("button", {
				"aria-pressed": o.value === "pending",
				onClick: D[1] ||= (e) => {
					o.value = "pending", c.value = null;
				}
			}, "待分类" + M(v.value.length ? " · " + v.value.length : ""), 9, Id),
			G("button", {
				"aria-pressed": o.value === "graph",
				onClick: D[2] ||= (e) => {
					o.value = "graph", c.value = null;
				}
			}, "记忆图谱", 8, Ld)
		]), o.value === "graph" ? (U(), W(H, { key: 1 }, [G("section", uf, [
			G("header", df, [D[40] ||= G("h3", null, "节点与关系", -1), G("span", null, M(_.value.length) + " 个节点 · " + M(a.value.edges.length) + " 条边", 1)]),
			G("label", ff, [D[42] ||= q("查看事实", -1), B(G("select", {
				"onUpdate:modelValue": D[15] ||= (e) => l.value = e,
				onChange: D[16] ||= (e) => {
					u.value = null, p.value = !1;
				}
			}, [D[41] ||= G("option", { value: "" }, "请选择", -1), (U(!0), W(H, null, V(_.value, (e) => (U(), W("option", {
				key: e.id,
				value: e.id
			}, M(e.title), 9, pf))), 128))], 544), [[_c, l.value]])]),
			g.value.has(l.value) ? (U(), W("div", mf, [G("div", hf, [G("h3", null, M(x(l.value)), 1), G("p", null, M(g.value.get(l.value).content), 1)]), G("div", gf, [b.value.length ? J("", !0) : (U(), W("p", _f, "该事实尚无关系。")), (U(!0), W(H, null, V(b.value, (e) => (U(), W("div", {
				key: R(ru)(e),
				class: "sd-branch"
			}, [G("button", { onClick: (t) => te(e) }, M(e.from === l.value ? "→" : "←") + " " + M(R(ql)[e.type].label), 9, vf), G("button", {
				class: "sd-node",
				onClick: (t) => {
					l.value = e.from === l.value ? e.to : e.from, u.value = null, p.value = !1;
				}
			}, M(x(e.from === l.value ? e.to : e.from)), 9, yf)]))), 128))])])) : J("", !0),
			l.value ? (U(), W("div", bf, [G("button", { onClick: D[17] ||= (e) => te() }, "新建关系"), G("button", { onClick: D[18] ||= (e) => {
				p.value = !p.value, m.value = "", h.value = g.value.get(l.value)?.content || "";
			} }, "合并事实")])) : J("", !0),
			p.value ? (U(), W("div", xf, [
				G("label", Sf, [q("合并到 " + M(x(l.value)), 1), B(G("select", { "onUpdate:modelValue": D[19] ||= (e) => m.value = e }, [D[43] ||= G("option", { value: "" }, "选择来源事实", -1), (U(!0), W(H, null, V(_.value.filter((e) => !e.locked && e.id !== l.value), (e) => (U(), W("option", {
					key: e.id,
					value: e.id
				}, M(e.title), 9, Cf))), 128))], 512), [[_c, m.value]])]),
				m.value ? (U(), W("p", wf, M(g.value.get(m.value)?.content), 1)) : J("", !0),
				K(pu, {
					modelValue: h.value,
					"onUpdate:modelValue": D[20] ||= (e) => h.value = e,
					label: "合并后的正文"
				}, null, 8, ["modelValue"]),
				G("button", {
					disabled: !m.value,
					onClick: ne
				}, "确认合并", 8, Tf)
			])) : J("", !0),
			u.value ? (U(), W("div", Ef, [
				G("div", Df, [G("label", Of, [D[45] ||= q("起点", -1), B(G("select", { "onUpdate:modelValue": D[21] ||= (e) => u.value.from = e }, [D[44] ||= G("option", { value: "" }, "请选择", -1), (U(!0), W(H, null, V(_.value, (e) => (U(), W("option", {
					key: e.id,
					value: e.id
				}, M(e.title), 9, kf))), 128))], 512), [[_c, u.value.from]])]), G("label", Af, [D[47] ||= q("终点", -1), B(G("select", { "onUpdate:modelValue": D[22] ||= (e) => u.value.to = e }, [D[46] ||= G("option", { value: "" }, "请选择", -1), (U(!0), W(H, null, V(_.value, (e) => (U(), W("option", {
					key: e.id,
					value: e.id
				}, M(e.title), 9, jf))), 128))], 512), [[_c, u.value.to]])])]),
				G("label", Mf, [D[48] ||= q("类型", -1), B(G("select", { "onUpdate:modelValue": D[23] ||= (e) => u.value.type = e }, [(U(!0), W(H, null, V(R(ql), (e, t) => (U(), W("option", {
					key: t,
					value: t
				}, M(e.label), 9, Nf))), 128))], 512), [[_c, u.value.type]])]),
				G("p", null, M(R(ql)[u.value.type].meaning), 1),
				K(pu, {
					modelValue: u.value.reason,
					"onUpdate:modelValue": D[24] ||= (e) => u.value.reason = e,
					label: "关系依据",
					rows: 3
				}, null, 8, ["modelValue"]),
				G("div", Pf, [
					G("button", { onClick: D[25] ||= (e) => [u.value.from, u.value.to] = [u.value.to, u.value.from] }, "交换方向"),
					d.value ? (U(), W("button", {
						key: 0,
						class: "sd-danger",
						onClick: E
					}, "删除关系")) : J("", !0),
					G("button", { onClick: D[26] ||= (e) => u.value = null }, "关闭"),
					G("button", {
						class: "sd-primary",
						onClick: T
					}, "保存关系")
				])
			])) : J("", !0)
		]), G("section", Ff, [
			D[50] ||= G("h3", null, "整理图谱", -1),
			R(t).graphProgress ? (U(), W("p", If, M(R(t).graphProgress), 1)) : J("", !0),
			G("div", Lf, [R(t).busy.includes("graph") ? (U(), W("button", {
				key: 0,
				onClick: D[27] ||= (e) => R(n).cancel("graph")
			}, "取消整理")) : R(t).channels.some((e) => e.id === a.value.settings.bindings.graph) ? (U(), W(H, { key: 1 }, [G("button", { onClick: D[28] ||= (e) => R(r)(() => R(n).organize("full")) }, "全量整理"), G("button", { onClick: D[29] ||= (e) => R(r)(() => R(n).organize("incremental")) }, "增量整理")], 64)) : (U(), W("button", {
				key: 2,
				onClick: D[30] ||= (e) => R(i)("settings")
			}, "配置图谱渠道"))]),
			a.value.graphPreview ? (U(), W("div", Rf, [
				G("p", null, M(a.value.graphPreview.mode === "full" ? "批准后以勾选的关系替换现有图谱。" : "批准后增加勾选的关系。"), 1),
				(U(!0), W(H, null, V(f.value, (e) => (U(), W("article", {
					key: R(ru)(e),
					class: "sd-subcard sd-stack"
				}, [
					G("label", null, [B(G("input", {
						type: "checkbox",
						"onUpdate:modelValue": (t) => e.accepted = t
					}, null, 8, zf), [[hc, e.accepted]]), q(" " + M(x(e.from)) + " → " + M(R(ql)[e.type].label) + " → " + M(x(e.to)), 1)]),
					G("p", null, [
						q(M(g.value.get(e.from)?.content), 1),
						D[49] ||= G("br", null, null, -1),
						q(M(g.value.get(e.to)?.content), 1)
					]),
					K(pu, {
						modelValue: e.reason,
						"onUpdate:modelValue": (t) => e.reason = t,
						label: "依据",
						rows: 2
					}, null, 8, ["modelValue", "onUpdate:modelValue"])
				]))), 128)),
				G("div", Bf, [G("button", { onClick: D[31] ||= (e) => R(r)(() => R(n).mutate((e) => {
					e.graphPreview = null;
				})) }, "取消预览"), G("button", {
					class: "sd-primary",
					onClick: D[32] ||= (e) => R(r)(() => R(n).applyGraph(JSON.parse(JSON.stringify(f.value))))
				}, "应用获批关系")])
			])) : J("", !0)
		])], 64)) : (U(), W(H, { key: 0 }, [
			G("div", Rd, [K(vd, {
				modelValue: s.value,
				"onUpdate:modelValue": D[3] ||= (e) => s.value = e,
				label: "搜索事实、人物、别名"
			}, null, 8, ["modelValue"]), o.value === "pending" ? (U(), W("p", zd, "这些旧条目保留原文和控制属性。保存新类别后恢复召回。")) : (U(), W("div", Bd, [G("button", {
				class: "sd-primary",
				onClick: D[4] ||= (e) => S()
			}, "新增事实")]))]),
			c.value ? (U(), W("section", Vd, [
				G("header", Hd, [G("h3", null, M(c.value.id ? "编辑事实" : "新建事实"), 1), G("button", { onClick: D[5] ||= (e) => c.value = null }, "关闭编辑")]),
				G("fieldset", {
					disabled: c.value.locked,
					class: "sd-stack"
				}, [
					G("div", Wd, [G("label", Gd, [D[33] ||= q("类别", -1), B(G("select", { "onUpdate:modelValue": D[6] ||= (e) => c.value.category = e }, [R(Kl)[c.value.category] ? J("", !0) : (U(), W("option", {
						key: 0,
						value: c.value.category
					}, "旧类别 · " + M(c.value.category), 9, Kd)), (U(!0), W(H, null, V(R(Kl), (e, t) => (U(), W("option", {
						key: t,
						value: t
					}, M(e), 9, qd))), 128))], 512), [[_c, c.value.category]])]), G("label", Jd, [D[34] ||= q("重要度", -1), B(G("input", {
						type: "number",
						"onUpdate:modelValue": D[7] ||= (e) => c.value.importance = e,
						min: "1",
						max: "5"
					}, null, 512), [[
						Z,
						c.value.importance,
						void 0,
						{ number: !0 }
					]])])]),
					G("label", Yd, [D[35] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": D[8] ||= (e) => c.value.title = e }, null, 512), [[Z, c.value.title]])]),
					K(pu, {
						modelValue: c.value.content,
						"onUpdate:modelValue": D[9] ||= (e) => c.value.content = e,
						label: "可独立理解的客观事实"
					}, null, 8, ["modelValue"]),
					G("div", Xd, [
						G("label", Zd, [D[36] ||= q("故事时间", -1), B(G("input", { "onUpdate:modelValue": D[10] ||= (e) => c.value.storyTime = e }, null, 512), [[Z, c.value.storyTime]])]),
						G("label", Qd, [D[37] ||= q("相关人物", -1), B(G("input", { "onUpdate:modelValue": D[11] ||= (e) => c.value.peopleText = e }, null, 512), [[Z, c.value.peopleText]])]),
						G("label", $d, [D[38] ||= q("别名", -1), B(G("input", { "onUpdate:modelValue": D[12] ||= (e) => c.value.aliasesText = e }, null, 512), [[Z, c.value.aliasesText]])])
					]),
					G("label", null, [B(G("input", {
						type: "checkbox",
						"onUpdate:modelValue": D[13] ||= (e) => c.value.permanent = e
					}, null, 512), [[hc, c.value.permanent]]), D[39] ||= q(" 常驻", -1)])
				], 8, Ud),
				G("div", ef, [
					c.value.id ? (U(), W("button", {
						key: 0,
						onClick: D[14] ||= (e) => ee(c.value, "locked")
					}, M(c.value.locked ? "解锁" : "锁定"), 1)) : J("", !0),
					c.value.id && !c.value.locked ? (U(), W("button", {
						key: 1,
						class: "sd-danger",
						onClick: w
					}, "删除")) : J("", !0),
					G("button", {
						class: "sd-primary",
						disabled: c.value.locked,
						onClick: C
					}, "保存事实", 8, tf)
				])
			])) : J("", !0),
			y.value.length ? J("", !0) : (U(), W("p", nf, "没有符合条件的事实。")),
			(U(!0), W(H, null, V(y.value, (e) => (U(), W("article", {
				key: e.id,
				class: "sd-card sd-listrow"
			}, [G("div", rf, [
				G("h3", null, M(e.title), 1),
				G("p", null, [
					q(M(R(Kl)[e.category] || e.category) + " · 重要度 " + M(e.importance), 1),
					e.locked ? (U(), W("span", af, " · 已锁定")) : J("", !0),
					e.permanent ? (U(), W("span", of, " · 常驻")) : J("", !0)
				]),
				G("p", null, M(e.content), 1)
			]), G("div", sf, [G("button", { onClick: (t) => S(e) }, "查看与编辑", 8, cf), o.value === "facts" ? (U(), W("button", {
				key: 0,
				onClick: (t) => {
					l.value = e.id, o.value = "graph";
				}
			}, "关系", 8, lf)) : J("", !0)])]))), 128))
		], 64))], 64)) : (U(), W("p", Nd, M(R(t).blocker), 1));
	}
}), Hf = { type: "string" }, Uf = { type: ["string", "null"] }, Wf = (e) => ({
	type: "object",
	additionalProperties: !1,
	properties: e,
	required: Object.keys(e)
}), Gf = (e, t) => ({
	name: `scene_diary_${e}`,
	strict: !0,
	value: Wf(t)
}), Kf = Wf({
	category: {
		type: "string",
		enum: [
			"preference",
			"habit",
			"promise",
			"relationship",
			"event",
			"item_place"
		]
	},
	title: Hf,
	content: Hf,
	people: {
		type: "array",
		items: Hf
	},
	aliases: {
		type: "array",
		items: Hf
	},
	importance: {
		type: "integer",
		minimum: 1,
		maximum: 5
	},
	storyTime: Uf
}), qf = Object.freeze({
	diary: Gf("diary", {
		title: Hf,
		diary: Hf
	}),
	memory: Gf("memory", { memories: {
		type: "array",
		items: Kf
	} }),
	growth: Gf("growth", { characterGrowth: Hf }),
	maintenance: Gf("maintenance", { operations: {
		type: "array",
		items: Wf({
			action: {
				type: "string",
				enum: ["merge", "link"]
			},
			memberIds: {
				type: "array",
				items: Hf
			},
			targetId: Uf,
			title: Uf,
			content: Uf,
			category: Uf,
			a: Uf,
			b: Uf,
			reason: Hf
		})
	} })
});
function Jf(e) {
	let t = [];
	for (let n = e, r = 0; n && r < 4; n = n.cause, r++) t.push(String(n.message || n));
	return t.join(" ");
}
var Yf = "上一轮响应缺少必需字段，或不是可解析的完整 JSON。请按格式重新输出完整 JSON 对象及必需数组；字符串内的换行写成 \\n，双引号写成 \\\"。不要输出 Markdown 或说明。";
function Xf(e, t = "json_schema") {
	return t === "json_object" ? { type: t } : {
		type: "json_schema",
		json_schema: {
			name: e.name,
			strict: e.strict ?? !0,
			schema: structuredClone(e.value)
		}
	};
}
function Zf(e, t) {
	let n = [];
	for (let t = e, r = 0; t && r < 4; t = t.cause, r++) n.push(t);
	let r = Jf(e), i = n.map((e) => `${e.code || ""} ${e.providerCode || ""} ${e.category || ""}`).join(" ");
	if (n.some((e) => e.name === "AbortError" || [
		401,
		403,
		402,
		429
	].includes(Number(e.providerStatus)) || [
		401,
		403,
		402,
		429
	].includes(Number(e.bridgeStatus)) || Number(e.providerStatus) >= 500) || /SCENE_DIARY_(?:STALE|JSON_(?:NETWORK|CONFIG|PROTOCOL|TRANSPORT|REFUSAL))/i.test(i) || /network|timeout|timed out|dns|tls|quota|rate[_ -]?limit|authentication|unauthori[sz]ed|forbidden|insufficient|permission denied|internal server error|service unavailable|invalid[_ -]?(?:api[_ -]?key|key)|api[_ -]?key.*(?:invalid|missing)|网络|超时|额度|限流/i.test(`${i} ${r}`) || /\b(?:HTTP|status)\s*[:=]?\s*(?:401|402|403|429|5\d\d)\b/i.test(r) || /invalid (?:json )?schema|schema.*(?:required|additionalProperties|properties|minimum|maximum)|must.*(?:contain|include).*\bjson\b|context|token.*(?:limit|exceed)/i.test(r)) return !1;
	let a = t.replace("_", "[_ -]");
	return RegExp(`(?:${a}|response[_ -]format(?:[. ]type)?)[^\\n]{0,100}(?:not supported|unsupported|unavailable|not available|not enabled|not allowed|unknown type)`, "i").test(r) || RegExp(`(?:not supported|unsupported|unavailable|not available|not enabled|unknown type)[^\\n]{0,100}(?:${a}|response[_ -]format(?:[. ]type)?)`, "i").test(r) || /response_format[.\[ '\"]*type/i.test(`${n.map((e) => e.param || "").join(" ")} ${r}`) && /(?:must be one of|allowed values|supported values|invalid enum|not in.*enum)/i.test(r);
}
function Qf(e) {
	return Object.assign(Error(e), { code: "SCENE_DIARY_SCHEMA" });
}
function $f(e, t, n) {
	let r = Array.isArray(t.type) ? t.type : [t.type];
	if (!r.some((t) => t === "null" ? e === null : t === "object" ? typeof e == "object" && !!e && !Array.isArray(e) : t === "array" ? Array.isArray(e) : t === "integer" ? Number.isInteger(e) : typeof e === t)) throw Qf(`${n} 类型不符合 JSON 协议（需要 ${r.join("/")}）`);
	if (t.enum && !t.enum.includes(e)) throw Qf(`${n} 不在允许值中`);
	if (typeof e == "number" && (e < (t.minimum ?? -Infinity) || e > (t.maximum ?? Infinity))) throw Qf(`${n} 超出允许范围`);
	if (typeof e == "object" && e && !Array.isArray(e)) {
		for (let r of t.required || []) if (!Object.hasOwn(e, r)) throw Qf(`${n}.${r} 缺少必需字段`);
		for (let r of Object.keys(e)) Object.hasOwn(t.properties || {}, r) && $f(e[r], t.properties[r], `${n}.${r}`);
	}
	Array.isArray(e) && t.items && e.forEach((e, r) => $f(e, t.items, `${n}[${r}]`));
}
function ep(e, t) {
	let n;
	try {
		n = typeof e == "string" ? JSON.parse(e.trim()) : e;
	} catch {
		throw Qf("JSON 无法完整解析");
	}
	let r = structuredClone(t.value);
	return t.name === qf.maintenance.name && delete r.properties.operations.items, t.name === qf.memory.name && delete r.properties.memories.items, $f(n, r, "$"), n;
}
var tp = "只输出一个完整、可解析的 JSON 对象及所有必需字段。不要输出 Markdown、说明或工具调用。";
function np(e) {
	return Array.isArray(e) ? [...structuredClone(e), {
		role: "user",
		content: tp
	}] : [{
		role: "user",
		content: `${e}\n${tp}`
	}];
}
async function rp(e, t, n, r, i, a, { assertCurrent: o = () => {}, onProgress: s = () => {}, connectionLabel: c = "" } = {}) {
	let l = "json_schema", u = np(t), d = async (t, r) => {
		o(), s(`正在请求 ${l}…`);
		let i = await e(t, r, Xf(n, l));
		return o(), i;
	}, f;
	try {
		f = await d(u, i);
	} catch (e) {
		if (!Zf(e, l)) throw e;
		o(), l = "json_object", s("json_schema 被拒，尝试 json_object…");
		try {
			f = await d(u, i);
		} catch (t) {
			throw Zf(t, l) ? Object.assign(/* @__PURE__ */ Error(`${a}连接${c ? `（${c}）` : ""}拒绝两种 JSON 格式：json_schema：${Jf(e)}；json_object：${Jf(t)}`), { code: "SCENE_DIARY_JSON_FORMATS_REJECTED" }) : t;
		}
	}
	let p = (e) => {
		let t = ep(e, n);
		try {
			return r(JSON.stringify(t));
		} catch (e) {
			throw /JSON.*无法解析|日记正文为空|角色成长内容为空|角色成长超过 \d+ 字符/.test(e.message) ? Qf(e.message) : e;
		}
	};
	try {
		return p(f);
	} catch (e) {
		if (e?.code !== "SCENE_DIARY_SCHEMA") throw e;
		o(), s(`使用 ${l} 修复 JSON 输出…`);
		let t = await d([...u, {
			role: "user",
			content: `${Yf} 结构错误：${e.message}`
		}], Math.min(i * 2, 16384));
		try {
			return p(t);
		} catch (e) {
			throw e?.code === "SCENE_DIARY_SCHEMA" ? Object.assign(/* @__PURE__ */ Error(`${a}两次输出均未满足 JSON 格式或必需字段：${e.message}`), { code: "SCENE_DIARY_JSON_CONTENT" }) : e;
		}
	}
}
// redact.js
function ip(e, t = []) {
	let n = String(e ?? "");
	for (let e of t.filter((e) => typeof e == "string" && e.length)) n = n.split(e).join("[已隐藏]");
	return n.replace(/https?:\/\/[^\s"'<>]+/gi, "[地址已隐藏]").replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[已隐藏]").replace(/\bBearer\s+[^\s,"'}]+/gi, "Bearer [已隐藏]").replace(/((?:api[_-]?key|authorization|proxy_password|password|secret|token)\s*["']?\s*[:=]\s*)["']?[^\s,"'}]+/gi, "$1[已隐藏]").slice(0, 600);
}
// channels.js
var ap = "scene_diary_channels", op = "/api/backends/chat-completions/", sp = () => ({
	id: Vc("channel"),
	name: "",
	url: "",
	key: "",
	model: "",
	temperature: .4,
	maxTokens: 4096
});
function cp(e) {
	return e.extensionSettings?.[ap] || [];
}
function lp(e, t) {
	e.extensionSettings[ap] = t, e.saveSettingsDebounced();
}
function up(e) {
	let t = new URL(e);
	if (!["http:", "https:"].includes(t.protocol) || t.username || t.password || t.search || t.hash) throw Error("请输入不含认证信息的 HTTP(S) API 地址。");
	let n = t.pathname.replace(/\/+$/, "").replace(/\/(?:chat\/completions|models)$/, "");
	return n ||= "/v1", t.origin + n;
}
function dp(e) {
	let t = up(e.url);
	if (!e.name.trim() || !e.model.trim()) throw Error("请填写渠道名称和模型。");
	if (!Number.isFinite(e.temperature) || e.temperature < 0 || e.temperature > 2 || !Number.isInteger(e.maxTokens) || e.maxTokens < 1) throw Error("请检查温度与最大输出 token。");
	return {
		...e,
		url: t,
		name: e.name.trim(),
		model: e.model.trim(),
		key: e.key.trim()
	};
}
async function fp(e, t, n, r, i) {
	let a = t.key ? { Authorization: "Bearer " + t.key } : {}, o = {
		chat_completion_source: "custom",
		custom_api_format: "openai_compat",
		custom_url: up(t.url),
		custom_include_headers: JSON.stringify(a),
		...r
	};
	try {
		let r = await fetch(op + n, {
			method: "POST",
			headers: e.getRequestHeaders(),
			signal: i,
			body: JSON.stringify(o)
		}), a = await r.text(), s;
		try {
			s = JSON.parse(a);
		} catch {
			s = { message: a };
		}
		if (!r.ok || s?.error) {
			let e = s.error || s;
			throw Object.assign(Error(ip(e.message || (typeof e == "string" ? e : "HTTP " + r.status), [t.key])), {
				bridgeStatus: r.status,
				providerStatus: e.status || e.status_code,
				providerCode: ip(e.code || "", [t.key]),
				param: e.param
			});
		}
		if (String(s?.id || "").startsWith("tauritavern-error-")) throw Error("TauriTavern 代理未返回有效补全，请检查渠道或更新宿主。");
		return s;
	} catch (e) {
		throw i?.throwIfAborted(), e.message = ip(e.message, [t.key]), e;
	}
}
async function pp(e, t, n) {
	let r = await fp(e, t, "status", {}, n), i = r?.data ?? r?.models;
	if (!Array.isArray(i)) throw Error("代理未返回模型列表，可手动填写模型。");
	return i.map((e) => typeof e == "string" ? e : e.id).filter(Boolean).sort();
}
async function mp(e, t, n, r, i, a) {
	let o = (await fp(e, t, "generate", {
		model: t.model,
		messages: n,
		stream: !1,
		type: "quiet",
		response_format: i,
		max_tokens: r,
		temperature: t.temperature,
		custom_include_body: JSON.stringify(i ? { response_format: i } : {})
	}, a))?.choices?.[0];
	if (o?.message?.refusal || o?.finish_reason === "content_filter") throw Error("模型拒绝生成该内容。");
	let s = o?.message?.content;
	if (typeof s != "string" || !s.trim()) throw Error("渠道未返回文本。");
	return s;
}
var hp = {
	name: "scene_diary_channel_test",
	value: {
		type: "object",
		additionalProperties: !1,
		properties: { ok: { type: "boolean" } },
		required: ["ok"]
	}
};
function gp(e, t, n) {
	return _p(e, dp(t), "返回 JSON {\"ok\":true}。", hp, n, "渠道测试", void 0, 64);
}
function _p(e, t, n, r, i, a, o, s = t.maxTokens) {
	return rp((n, r, a) => mp(e, t, n, Math.min(r, t.maxTokens), a, i), [{
		role: "system",
		content: "根据给出的素材与任务要求输出 JSON。"
	}, {
		role: "user",
		content: n
	}], r, JSON.parse, s, a, {
		assertCurrent: () => i?.throwIfAborted(),
		onProgress: o,
		connectionLabel: ip(t.name, [t.key])
	});
}
// src/pages/Settings.vue?vue&type=script&setup=true&lang.ts
var vp = { class: "sd-card sd-stack" }, yp = { class: "sd-section-title" }, bp = ["disabled"], xp = ["disabled", "onClick"], Sp = { class: "sd-form-grid" }, Cp = { class: "sd-field" }, wp = { class: "sd-field" }, Tp = { class: "sd-field" }, Ep = { class: "sd-field" }, Dp = { id: "sd-channel-models" }, Op = ["value"], kp = { class: "sd-field" }, Ap = { class: "sd-field" }, jp = { class: "sd-actions" }, Mp = ["disabled"], Np = ["disabled"], Pp = ["disabled"], Fp = {
	key: 0,
	class: "sd-card"
}, Ip = { class: "sd-card sd-stack" }, Lp = { class: "sd-form-grid" }, Rp = ["onUpdate:modelValue"], zp = ["value"], Bp = {
	class: "sd-card",
	open: ""
}, Vp = { class: "sd-stack" }, Hp = { class: "sd-form-grid" }, Up = { class: "sd-field" }, Wp = { class: "sd-field" }, Gp = { class: "sd-field" }, Kp = { class: "sd-field" }, qp = { class: "sd-field" }, Jp = { class: "sd-field" }, Yp = { class: "sd-field" }, Xp = { class: "sd-field" }, Zp = { class: "sd-field" }, Qp = { class: "sd-card" }, $p = { class: "sd-stack" }, em = { class: "sd-form-grid" }, tm = { class: "sd-field" }, nm = { class: "sd-field" }, rm = { class: "sd-field" }, im = { class: "sd-field" }, am = { class: "sd-form-grid" }, om = { class: "sd-field" }, sm = { class: "sd-field" }, cm = { class: "sd-field" }, lm = { class: "sd-card" }, um = { class: "sd-stack" }, dm = ["onUpdate:modelValue"], fm = { class: "sd-card" }, pm = { class: "sd-stack" }, mm = { class: "sd-field" }, hm = { class: "sd-actions sd-sticky" }, gm = /* @__PURE__ */ $r({
	__name: "Settings",
	setup(e) {
		let { view: t, host: n, run: r, notice: i, select: a } = Wl(), o = /* @__PURE__ */ L(null), s = /* @__PURE__ */ L(null), c = /* @__PURE__ */ L([]), l = /* @__PURE__ */ L(!1), u = null;
		vi(() => u?.abort());
		let d = n.getContext, f = () => d().accountStorage, p = /* @__PURE__ */ L(f()?.getItem("scene_diary_embedding_key") || ""), m = /* @__PURE__ */ L(f()?.getItem("scene_diary_rerank_key") || ""), h = X(() => JSON.stringify(t.value.state?.settings || null)), g = /* @__PURE__ */ L({});
		Hr(h, (e) => {
			if (o.value = JSON.parse(e), !o.value) return;
			let t = {};
			for (let e of ["user", "character"]) {
				t[e] = {};
				for (let n of ["bodyTagPairs", "storyTimeTagPairs"]) t[e][n] = o.value.extraction[e][n].map((e) => e.open + " " + e.close).join("\n");
			}
			g.value = t;
		}, { immediate: !0 });
		function _(e = sp()) {
			s.value = { ...e }, c.value = [];
		}
		function v() {
			return r(() => {
				let e = dp(s.value);
				lp(d(), [...t.value.channels.filter((t) => t.id !== e.id), e]), n.refresh(), s.value = null, i.value = "渠道已提交保存。";
			});
		}
		function y() {
			if (s.value && window.confirm("删除该渠道？已绑定的任务需要重新选择。")) return r(() => {
				lp(d(), t.value.channels.filter((e) => e.id !== s.value.id)), n.refresh(), s.value = null;
			});
		}
		async function b(e) {
			let t = u = new AbortController();
			l.value = !0;
			let n = { ...s.value };
			try {
				await r(async () => {
					if (e === "models") c.value = await pp(d(), n, t.signal), i.value = "返回 " + c.value.length + " 个模型。";
					else {
						if ((await gp(d(), n, t.signal)).ok !== !0) throw Error("渠道返回了意外的测试结果。");
						i.value = "结构化渠道测试通过。";
					}
				});
			} finally {
				u = null, l.value = !1;
			}
		}
		function x(e) {
			return e.split(/\r?\n/).map((e) => e.trim()).filter(Boolean).map((e) => {
				let [t, n] = e.split(/\s+/), r = qc({
					open: t,
					close: n
				});
				if (!r) throw Error("标签对无效。每行填写一对同名开始和结束标签。");
				return r;
			});
		}
		function S() {
			return r(async () => {
				let e = JSON.parse(JSON.stringify(o.value));
				for (let t of ["user", "character"]) for (let n of ["bodyTagPairs", "storyTimeTagPairs"]) e.extraction[t][n] = x(g.value[t][n]);
				if (e.semantic.enabled && (e.semantic.endpoint = Fl(e.semantic.endpoint), !e.semantic.model.trim())) throw Error("请填写 Embedding 模型。");
				if (e.semantic.rerank && (e.semantic.rerankEndpoint = Fl(e.semantic.rerankEndpoint, "重排"), !e.semantic.rerankModel.trim())) throw Error("请填写重排模型。");
				let r = Object.fromEntries(Object.entries(e.bindings).filter(([, e]) => t.value.channels.some((t) => t.id === e))), i = f();
				for (let [e, t] of [["scene_diary_embedding_key", p.value], ["scene_diary_rerank_key", m.value]]) t.trim() ? i?.setItem(e, t.trim()) : i?.removeItem(e);
				await n.mutate((t) => {
					t.settings = $l({
						...e,
						bindings: r
					}), Object.keys(Jl).every((e) => t.settings.bindings[e]) && (t.connectionSetupNeeded = !1);
				});
			});
		}
		return (e, n) => (U(), W(H, null, [G("section", vp, [
			G("header", yp, [n[32] ||= G("h3", null, "API 渠道", -1), G("button", {
				class: "sd-primary",
				disabled: l.value,
				onClick: n[0] ||= (e) => _()
			}, "新增渠道", 8, bp)]),
			n[39] ||= G("p", null, "渠道在当前酒馆账户内共用，任务分派按聊天保存。", -1),
			(U(!0), W(H, null, V(R(t).channels, (e) => (U(), W("div", {
				class: "sd-listrow",
				key: e.id
			}, [G("div", null, [G("strong", null, M(e.name), 1), G("p", null, M(e.model), 1)]), G("button", {
				disabled: l.value,
				onClick: (t) => _(e)
			}, "编辑", 8, xp)]))), 128)),
			s.value ? (U(), W("form", {
				key: 0,
				class: "sd-subcard sd-stack",
				onSubmit: wc(v, ["prevent"])
			}, [G("div", Sp, [
				G("label", Cp, [n[33] ||= q("名称", -1), B(G("input", {
					"onUpdate:modelValue": n[1] ||= (e) => s.value.name = e,
					autocomplete: "off",
					required: ""
				}, null, 512), [[Z, s.value.name]])]),
				G("label", wp, [n[34] ||= q("OpenAI 兼容 API 地址", -1), B(G("input", {
					"onUpdate:modelValue": n[2] ||= (e) => s.value.url = e,
					type: "url",
					placeholder: "https://example.com/v1",
					required: ""
				}, null, 512), [[
					Z,
					s.value.url,
					void 0,
					{ trim: !0 }
				]])]),
				G("label", Tp, [n[35] ||= q("API Key", -1), B(G("input", {
					"onUpdate:modelValue": n[3] ||= (e) => s.value.key = e,
					type: "password",
					autocomplete: "new-password"
				}, null, 512), [[Z, s.value.key]])]),
				G("label", Ep, [
					n[36] ||= q("模型", -1),
					B(G("input", {
						"onUpdate:modelValue": n[4] ||= (e) => s.value.model = e,
						list: "sd-channel-models",
						required: ""
					}, null, 512), [[Z, s.value.model]]),
					G("datalist", Dp, [(U(!0), W(H, null, V(c.value, (e) => (U(), W("option", {
						key: e,
						value: e
					}, null, 8, Op))), 128))])
				]),
				G("label", kp, [n[37] ||= q("温度", -1), B(G("input", {
					"onUpdate:modelValue": n[5] ||= (e) => s.value.temperature = e,
					type: "number",
					min: "0",
					max: "2",
					step: "0.05",
					required: ""
				}, null, 512), [[
					Z,
					s.value.temperature,
					void 0,
					{ number: !0 }
				]])]),
				G("label", Ap, [n[38] ||= q("最大输出 token", -1), B(G("input", {
					"onUpdate:modelValue": n[6] ||= (e) => s.value.maxTokens = e,
					type: "number",
					min: "1",
					step: "1",
					required: ""
				}, null, 512), [[
					Z,
					s.value.maxTokens,
					void 0,
					{ number: !0 }
				]])])
			]), G("div", jp, [
				l.value ? (U(), W("button", {
					key: 0,
					type: "button",
					onClick: n[7] ||= (e) => R(u)?.abort()
				}, "取消请求")) : (U(), W(H, { key: 1 }, [G("button", {
					type: "button",
					onClick: n[8] ||= (e) => b("models")
				}, "获取模型列表"), G("button", {
					type: "button",
					onClick: n[9] ||= (e) => b("test")
				}, "测试渠道")], 64)),
				G("button", {
					type: "button",
					disabled: l.value,
					onClick: n[10] ||= (e) => s.value = null
				}, "关闭", 8, Mp),
				R(t).channels.some((e) => e.id === s.value.id) ? (U(), W("button", {
					key: 2,
					type: "button",
					class: "sd-danger",
					disabled: l.value,
					onClick: y
				}, "删除", 8, Np)) : J("", !0),
				G("button", {
					class: "sd-primary",
					disabled: l.value
				}, "保存渠道", 8, Pp)
			])], 32)) : J("", !0)
		]), o.value ? (U(), W("form", {
			key: 1,
			class: "sd-stack",
			onSubmit: wc(S, ["prevent"])
		}, [
			G("section", Ip, [n[41] ||= G("h3", null, "任务分派", -1), G("div", Lp, [(U(!0), W(H, null, V(R(Jl), (e, r) => (U(), W("label", {
				key: r,
				class: "sd-field"
			}, [q(M(e) + " ", 1), B(G("select", { "onUpdate:modelValue": (e) => o.value.bindings[r] = e }, [n[40] ||= G("option", { value: void 0 }, "请选择渠道", -1), (U(!0), W(H, null, V(R(t).channels, (e) => (U(), W("option", {
				key: e.id,
				value: e.id
			}, M(e.name), 9, zp))), 128))], 8, Rp), [[_c, o.value.bindings[r]]])]))), 128))])]),
			G("details", Bp, [n[53] ||= G("summary", null, "上下文与召回", -1), G("div", Vp, [
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[11] ||= (e) => o.value.growthEnabled = e
				}, null, 512), [[hc, o.value.growthEnabled]]), n[42] ||= q(" 注入当前画像", -1)]),
				G("div", Hp, [
					G("label", Up, [n[43] ||= q("近期日记篇数", -1), B(G("input", {
						"onUpdate:modelValue": n[12] ||= (e) => o.value.recentDiaryCount = e,
						type: "number",
						min: "0",
						max: "20",
						required: ""
					}, null, 512), [[
						Z,
						o.value.recentDiaryCount,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Wp, [n[44] ||= q("近期日记额度（留空不限）", -1), B(G("input", {
						"onUpdate:modelValue": n[13] ||= (e) => o.value.recentDiaryBudget = e,
						type: "number",
						min: "0"
					}, null, 512), [[
						Z,
						o.value.recentDiaryBudget,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Gp, [n[45] ||= q("历史摘要额度", -1), B(G("input", {
						"onUpdate:modelValue": n[14] ||= (e) => o.value.historyBudget = e,
						type: "number",
						min: "0",
						required: ""
					}, null, 512), [[
						Z,
						o.value.historyBudget,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Kp, [n[46] ||= q("长期事实额度", -1), B(G("input", {
						"onUpdate:modelValue": n[15] ||= (e) => o.value.memoryTokenBudget = e,
						type: "number",
						min: "0",
						required: ""
					}, null, 512), [[
						Z,
						o.value.memoryTokenBudget,
						void 0,
						{ number: !0 }
					]])]),
					G("label", qp, [n[47] ||= q("用于查询的近邻消息数", -1), B(G("input", {
						"onUpdate:modelValue": n[16] ||= (e) => o.value.recallMessageCount = e,
						type: "number",
						min: "1",
						max: "20",
						required: ""
					}, null, 512), [[
						Z,
						o.value.recallMessageCount,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Jp, [n[48] ||= q("事实条数上限", -1), B(G("input", {
						"onUpdate:modelValue": n[17] ||= (e) => o.value.recallLimit = e,
						type: "number",
						min: "0",
						max: "30",
						required: ""
					}, null, 512), [[
						Z,
						o.value.recallLimit,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Yp, [n[49] ||= q("召回分数门槛", -1), B(G("input", {
						"onUpdate:modelValue": n[18] ||= (e) => o.value.recallScoreThreshold = e,
						type: "number",
						min: "0",
						max: "1",
						step: ".01",
						required: ""
					}, null, 512), [[
						Z,
						o.value.recallScoreThreshold,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Xp, [n[50] ||= q("图谱候选数量", -1), B(G("input", {
						"onUpdate:modelValue": n[19] ||= (e) => o.value.maintenanceCandidateLimit = e,
						type: "number",
						min: "1",
						max: "60",
						required: ""
					}, null, 512), [[
						Z,
						o.value.maintenanceCandidateLimit,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Zp, [n[51] ||= q("整理分数门槛", -1), B(G("input", {
						"onUpdate:modelValue": n[20] ||= (e) => o.value.maintenanceScoreThreshold = e,
						type: "number",
						min: "0",
						max: "1",
						step: ".01",
						required: ""
					}, null, 512), [[
						Z,
						o.value.maintenanceScoreThreshold,
						void 0,
						{ number: !0 }
					]])])
				]),
				n[52] ||= G("p", null, "额度采用估算 token。单篇或单条超出可用额度时会跳过，可在诊断中查看。", -1)
			])]),
			G("details", Qp, [n[63] ||= G("summary", null, "Embedding 与重排", -1), G("div", $p, [
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[21] ||= (e) => o.value.semantic.enabled = e
				}, null, 512), [[hc, o.value.semantic.enabled]]), n[54] ||= q(" 使用向量检索", -1)]),
				G("div", em, [
					G("label", tm, [n[55] ||= q("Embedding 完整地址", -1), B(G("input", {
						"onUpdate:modelValue": n[22] ||= (e) => o.value.semantic.endpoint = e,
						type: "url",
						placeholder: "https://example.com/v1/embeddings"
					}, null, 512), [[
						Z,
						o.value.semantic.endpoint,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", nm, [n[56] ||= q("Embedding 模型", -1), B(G("input", { "onUpdate:modelValue": n[23] ||= (e) => o.value.semantic.model = e }, null, 512), [[
						Z,
						o.value.semantic.model,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", rm, [n[57] ||= q("Embedding 密钥", -1), B(G("input", {
						"onUpdate:modelValue": n[24] ||= (e) => p.value = e,
						type: "password",
						autocomplete: "new-password"
					}, null, 512), [[Z, p.value]])]),
					G("label", im, [n[58] ||= q("向量维度（可选）", -1), B(G("input", {
						"onUpdate:modelValue": n[25] ||= (e) => o.value.semantic.dimensions = e,
						type: "number",
						min: "1"
					}, null, 512), [[
						Z,
						o.value.semantic.dimensions,
						void 0,
						{ number: !0 }
					]])])
				]),
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[26] ||= (e) => o.value.semantic.rerank = e
				}, null, 512), [[hc, o.value.semantic.rerank]]), n[59] ||= q(" 使用 rerank 重排", -1)]),
				G("div", am, [
					G("label", om, [n[60] ||= q("Rerank 完整地址", -1), B(G("input", {
						"onUpdate:modelValue": n[27] ||= (e) => o.value.semantic.rerankEndpoint = e,
						type: "url",
						placeholder: "https://example.com/v1/rerank"
					}, null, 512), [[
						Z,
						o.value.semantic.rerankEndpoint,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", sm, [n[61] ||= q("Rerank 模型", -1), B(G("input", { "onUpdate:modelValue": n[28] ||= (e) => o.value.semantic.rerankModel = e }, null, 512), [[
						Z,
						o.value.semantic.rerankModel,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", cm, [n[62] ||= q("Rerank 密钥", -1), B(G("input", {
						"onUpdate:modelValue": n[29] ||= (e) => m.value = e,
						type: "password",
						autocomplete: "new-password"
					}, null, 512), [[Z, m.value]])])
				])
			])]),
			G("details", lm, [n[66] ||= G("summary", null, "正文和故事时间标签", -1), G("div", um, [n[65] ||= G("p", null, "每行填写一对开始和结束标签，中间用空格分隔。正文标签留空时使用完整消息。", -1), (U(), W(H, null, V(["user", "character"], (e) => G("div", {
				key: e,
				class: "sd-stack"
			}, [
				G("h3", null, M(e === "user" ? "玩家" : "角色"), 1),
				K(pu, {
					modelValue: g.value[e].bodyTagPairs,
					"onUpdate:modelValue": (t) => g.value[e].bodyTagPairs = t,
					label: "正文标签",
					rows: 2
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				K(pu, {
					modelValue: g.value[e].storyTimeTagPairs,
					"onUpdate:modelValue": (t) => g.value[e].storyTimeTagPairs = t,
					label: "故事时间标签",
					rows: 2
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": (t) => o.value.extraction[e].requiredStoryTime = t
				}, null, 8, dm), [[hc, o.value.extraction[e].requiredStoryTime]]), n[64] ||= q(" 故事时间必填", -1)])
			])), 64))])]),
			G("details", fm, [n[68] ||= G("summary", null, "任务提示词", -1), G("div", pm, [G("label", mm, [n[67] ||= q("日记目标长度", -1), B(G("input", { "onUpdate:modelValue": n[30] ||= (e) => o.value.diaryTargetLength = e }, null, 512), [[Z, o.value.diaryTargetLength]])]), (U(), W(H, null, V({
				diary: "日记",
				growth: "角色成长",
				memory: "事实提取",
				maintenance: "图谱整理"
			}, (e, t) => K(pu, {
				key: t,
				modelValue: o.value.prompts[t],
				"onUpdate:modelValue": (e) => o.value.prompts[t] = e,
				label: e,
				rows: 3
			}, null, 8, [
				"modelValue",
				"onUpdate:modelValue",
				"label"
			])), 64))])]),
			G("div", hm, [G("button", {
				type: "button",
				onClick: n[31] ||= (e) => R(a)("diagnostics")
			}, "查看诊断"), n[69] ||= G("button", { class: "sd-primary" }, "保存聊天设置", -1)])
		], 32)) : (U(), W("p", Fp, M(R(t).blocker), 1))], 64));
	}
}), _m = { class: "sd-card sd-stack" }, vm = { class: "sd-section-title" }, ym = { key: 0 }, bm = {
	key: 0,
	class: "sd-log"
}, xm = { key: 0 }, Sm = { key: 0 }, Cm = /* @__PURE__ */ $r({
	__name: "Diagnostics",
	setup(e) {
		let { view: t, host: n } = Wl();
		return (e, r) => (U(), W("section", _m, [
			G("header", vm, [r[1] ||= G("h3", null, "运行诊断", -1), G("button", { onClick: r[0] ||= (...e) => R(n).cancelRecall && R(n).cancelRecall(...e) }, "取消当前召回")]),
			R(t).trace.length ? J("", !0) : (U(), W("p", ym, "暂无任务或召回记录。")),
			(U(!0), W(H, null, V(R(t).trace, (e, t) => (U(), W(H, { key: t }, [e.details?.length ? (U(), W("details", bm, [G("summary", null, [q(M(e.stage) + " · " + M(e.title) + " ", 1), e.ms == null ? J("", !0) : (U(), W("small", xm, M(Math.round(e.ms)) + " ms", 1))]), G("ul", null, [(U(!0), W(H, null, V(e.details, (e, t) => (U(), W("li", { key: t }, M(e), 1))), 128))])])) : (U(), W("p", {
				key: 1,
				class: me(["sd-log", { "sd-alert": e.status === "error" || e.status === "warning" }])
			}, [q(M(e.stage) + " · " + M(e.title) + " ", 1), e.ms == null ? J("", !0) : (U(), W("small", Sm, M(Math.round(e.ms)) + " ms", 1))], 2))], 64))), 128))
		]));
	}
}), wm = {
	class: "sd-window",
	"data-tt-mobile-surface": "fullscreen-window",
	role: "dialog",
	"aria-modal": "true",
	"aria-labelledby": "sd-title"
}, Tm = { class: "sd-header" }, Em = { class: "sd-heading" }, Dm = {
	id: "sd-title",
	tabindex: "-1"
}, Om = { class: "sd-actions" }, km = ["aria-pressed"], Am = ["aria-pressed"], jm = {
	class: "sd-tabs",
	"aria-label": "剧幕工作台导航"
}, Mm = ["aria-current", "onClick"], Nm = { class: "sd-body" }, Pm = {
	key: 0,
	class: "sd-alert",
	role: "alert"
}, Fm = { class: "sd-actions" }, Im = {
	key: 1,
	class: "sd-alert",
	role: "alert"
}, Lm = {
	key: 2,
	class: "sd-status",
	role: "status"
}, Rm = { class: "sd-status" }, zm = {
	key: 0,
	class: "sd-card sd-stack"
}, Bm = { class: "sd-prose" }, Vm = { class: "sd-prose" }, Hm = {
	key: 0,
	class: "sd-prose"
}, Um = { class: "sd-prose" }, Wm = {
	key: 4,
	class: "sd-card"
}, Gm = {
	class: "sd-footer",
	"aria-live": "polite"
}, Km = { key: 0 }, qm = { key: 1 }, Jm = { key: 2 }, Ym = { key: 3 }, Xm = /* @__PURE__ */ $r({
	__name: "App",
	setup(e) {
		let { view: t, host: n, opened: r, hasToolbar: i, page: a, error: o, notice: s, run: c, select: l, openWorkbench: u } = Wl(), d = [
			{
				id: "workbench",
				label: "剧幕工作台",
				icon: "fa-clapperboard",
				component: id
			},
			{
				id: "growth",
				label: "角色成长",
				icon: "fa-seedling",
				component: hd
			},
			{
				id: "diaries",
				label: "日记档案",
				icon: "fa-book-open",
				component: Md
			},
			{
				id: "memory",
				label: "长期记忆",
				icon: "fa-diagram-project",
				component: Vf
			}
		], f = {
			...Object.fromEntries(d.map((e) => [e.id, e.component])),
			settings: gm,
			diagnostics: Cm
		}, p = X(() => f[a.value] || id), m = X(() => t.value.blocker.startsWith("检测到 SP") && t.value.persisted), h = X(() => m.value?.diaries || m.value?.acts?.filter((e) => e.diary).map((e) => ({
			id: e.id,
			title: e.title,
			body: e.diary,
			summary: ""
		})) || []), g = X(() => d.find((e) => e.id === a.value)?.label || (a.value === "settings" ? "设置" : "诊断")), _ = null;
		Hr(r, (e) => {
			e ? _ = document.activeElement : _?.focus();
		});
		function v(e) {
			e.key === "Escape" && !e.defaultPrevented && r.value && (r.value = !1, e.stopPropagation());
		}
		document.addEventListener("keydown", v), vi(() => document.removeEventListener("keydown", v));
		function y() {
			return c(() => Gl(n.backup(), "scene-diary-" + t.value.chatId + ".json"));
		}
		return (e, f) => (U(), W(H, null, [R(i) ? J("", !0) : (U(), W("button", {
			key: 0,
			type: "button",
			class: "sd-floating",
			onClick: f[0] ||= (...e) => R(u) && R(u)(...e),
			title: "打开剧幕工作台",
			"aria-label": "打开剧幕工作台"
		}, [...f[6] ||= [G("i", { class: "fa-solid fa-clapperboard" }, null, -1)]])), R(r) ? (U(), W("div", {
			key: 1,
			class: "sd-backdrop",
			"data-tt-mobile-surface": "backdrop",
			onClick: f[5] ||= wc((e) => r.value = !1, ["self"])
		}, [G("section", wm, [
			G("header", Tm, [G("div", Em, [f[7] ||= G("i", {
				class: "fa-solid fa-clapperboard",
				"aria-hidden": "true"
			}, null, -1), G("h2", Dm, M(g.value), 1)]), G("div", Om, [
				G("button", {
					class: "sd-icon",
					title: "设置",
					"aria-label": "设置",
					"aria-pressed": R(a) === "settings",
					onClick: f[1] ||= (e) => R(l)("settings")
				}, [...f[8] ||= [G("i", { class: "fa-solid fa-gear" }, null, -1)]], 8, km),
				G("button", {
					class: "sd-icon",
					title: "诊断",
					"aria-label": "诊断",
					"aria-pressed": R(a) === "diagnostics",
					onClick: f[2] ||= (e) => R(l)("diagnostics")
				}, [...f[9] ||= [G("i", { class: "fa-solid fa-list-check" }, null, -1)]], 8, Am),
				G("button", {
					class: "sd-icon",
					title: "关闭",
					"aria-label": "关闭",
					onClick: f[3] ||= (e) => r.value = !1
				}, [...f[10] ||= [G("i", { class: "fa-solid fa-xmark" }, null, -1)]])
			])]),
			G("nav", jm, [(U(), W(H, null, V(d, (e) => G("button", {
				key: e.id,
				"aria-current": R(a) === e.id ? "page" : void 0,
				onClick: (t) => R(l)(e.id)
			}, [G("i", {
				class: me("fa-solid " + e.icon),
				"aria-hidden": "true"
			}, null, 2), G("span", null, M(e.label), 1)], 8, Mm)), 64))]),
			G("div", Nm, [
				R(t).saveError ? (U(), W("aside", Pm, [G("span", null, "保存失败。" + M(R(t).saveError) + " 当前内容仍可编辑。", 1), G("div", Fm, [G("button", { onClick: f[4] ||= (e) => R(c)(R(n).save) }, "重试保存"), R(t).state ? (U(), W("button", {
					key: 0,
					onClick: y
				}, "导出内容")) : J("", !0)])])) : J("", !0),
				R(o) ? (U(), W("aside", Im, M(R(o)), 1)) : J("", !0),
				R(s) ? (U(), W("aside", Lm, M(R(s)), 1)) : J("", !0),
				m.value && [
					"growth",
					"diaries",
					"memory"
				].includes(R(a)) ? (U(), W(H, { key: 3 }, [G("p", Rm, M(R(t).blocker) + " 已有内容可查阅。", 1), R(a) === "growth" ? (U(), W("section", zm, [f[11] ||= G("h3", null, "当前角色画像", -1), G("p", Bm, M(m.value.characterGrowth?.content || "尚未建立画像。"), 1)])) : R(a) === "diaries" ? (U(!0), W(H, { key: 1 }, V(h.value, (e) => (U(), W("article", {
					key: e.id,
					class: "sd-card sd-stack"
				}, [
					G("h3", null, M(e.title), 1),
					G("p", Vm, M(e.body), 1),
					e.summary ? (U(), W("p", Hm, M(e.summary), 1)) : J("", !0)
				]))), 128)) : (U(!0), W(H, { key: 2 }, V(m.value.memories || [], (e) => (U(), W("article", {
					key: e.id,
					class: "sd-card sd-stack"
				}, [G("h3", null, M(e.title), 1), G("p", Um, M(e.content), 1)]))), 128))], 64)) : m.value && R(a) === "settings" ? (U(), W("p", Wm, M(R(t).blocker), 1)) : (U(), ko(Ei(p.value), { key: R(t).chatId + "-" + R(a) }))
			]),
			G("footer", Gm, [R(t).pendingSaves ? (U(), W("span", Km, "正在保存…")) : R(t).saveError ? (U(), W("span", qm, "保存失败")) : R(t).saved ? (U(), W("span", Jm, "已提交宿主保存")) : (U(), W("span", Ym, "scene&diary"))])
		])])) : J("", !0)], 64));
	}
});
// recall-v7.js
function Zm(e) {
	return e.diaries.filter((e) => !e.needsReview).slice().sort((e, t) => t.createdAt - e.createdAt);
}
function Qm(e, t, n, r, i) {
	let a = [], o = [], s = 0;
	for (let c of e) {
		let e = i([...a, c].map(r));
		a.length >= t || yl(e) > n ? o.push(c) : (a.push(c), s = yl(e));
	}
	return {
		selected: a,
		skipped: o,
		cost: s,
		content: a.length ? i(a.map(r)) : ""
	};
}
var $m = (e) => (t) => "[" + e + "]\n" + t.join("\n\n") + "\n[/" + e + "]";
function eh(e) {
	let t = Zm(e), n = e.settings, r = Qm(t.slice(0, n.recentDiaryCount), n.recentDiaryCount, n.recentDiaryBudget ?? Infinity, (e) => e.title + "\n" + e.body, $m("scene&diary 近期日记"));
	r.content = r.selected.length ? $m("scene&diary 近期日记")([...r.selected].reverse().map((e) => e.title + "\n" + e.body)) : "";
	let i = new Set(r.selected.map((e) => e.id));
	return {
		full: r,
		history: t.filter((e) => !i.has(e.id) && !e.summaryPending && e.summary).map((e) => ({
			id: e.id,
			title: e.title,
			content: e.summary
		}))
	};
}
function th(e, t, n, r, i) {
	let a = new Map(e.map((e) => [e.id, e])), o = [...e.filter((e) => e.permanent).sort((e, t) => t.importance - e.importance).map((e) => ({
		memory: e,
		score: 1,
		via: "常驻"
	})), ...t.filter((e) => !e.memory.permanent && e.score >= i.recallScoreThreshold)], s = $m("scene&diary 长期事实"), c = i.memoryTokenBudget, l = (e) => xl(e.memory), u = Qm(o, i.recallLimit, c, l, s), d = new Set(u.selected.map((e) => e.memory.id)), f = new Set(bl(r)), p = new Map(t.map((e) => [e.memory.id, e.score])), m = [];
	for (let e of u.selected) for (let t of n) {
		let n = ql[t.type];
		if (!n) continue;
		let r = t.from === e.memory.id ? t.to : n.reverse && t.to === e.memory.id ? t.from : null, o = a.get(r);
		if (!o || d.has(r)) continue;
		let s = p.get(r) ?? 0;
		s < i.recallScoreThreshold && !bl(o.content).some((e) => f.has(e)) || (d.add(r), m.push({
			memory: o,
			score: s,
			via: n.label,
			reason: t.reason
		}));
	}
	m.sort((e, t) => t.score - e.score);
	let h = Qm([...u.selected, ...m], i.recallLimit, c, l, s);
	return {
		...h,
		skipped: [...u.skipped, ...h.skipped]
	};
}
function nh(e, t, n, r, { localOnly: i = !1, strict: a = !1 } = {}) {
	let o = e.settings.semantic, s = e.settings, c = /* @__PURE__ */ new Map();
	return async (l, u, d, { includePermanent: f = !1, useImportance: p = !0, excludeId: m = null } = {}) => {
		if (r?.throwIfAborted(), !l.length || !u.trim()) return [];
		let h = performance.now(), g = d === "历史日记" ? al(JSON.stringify(l)) : e.memoryRevision, _ = Al(l, d + ":" + g, { includePermanent: f }), v = l.filter((e) => f || !e.permanent), y = [t.embeddingKey, t.rerankKey], b = {
			account: t.account,
			chat: t.chat,
			space: e.memorySpaceId + ":" + d
		}, x = (e, t, r, i = []) => n({
			stage: d + " · " + e,
			status: t,
			title: r,
			details: i,
			ms: performance.now() - h
		}), S = (e) => {
			if (r?.throwIfAborted(), a) throw e;
			x("语义服务", "warning", Il(e, y));
		}, C = _(u, {
			useImportance: p,
			excludeId: m
		});
		if (x("BM25", "success", "候选 " + C.length + " 条"), !i && o.enabled && v.length) try {
			let e = d + ":" + g + ":" + f;
			c.has(e) || c.set(e, ih(v, b, o, t, r));
			let n = c.get(e), i = m && v.find((e) => e.id === m && e.content === u), [a, [s]] = await Promise.all([n, i ? n.then((e) => [e.get(i.id)]) : zl([u], o, t.embeddingKey, { signal: r })]);
			r?.throwIfAborted(), C = _(u, {
				vectors: a,
				queryVector: s,
				useImportance: p,
				excludeId: m
			}), x("向量", "success", "索引 " + a.size + " 条");
		} catch (e) {
			S(e);
		}
		if (!i && o.rerank && C.length) try {
			let e = await Rl(u, C.map((e) => e.memory.content), o, t.rerankKey, { signal: r });
			C = Ol(C, e, {
				absolute: !0,
				useImportance: p
			}), x("重排", "success", "重排 " + e.length + " 条");
		} catch (e) {
			S(e);
		}
		return x("排名", "success", "候选按相关性排列", C.slice(0, Math.max(8, s.recallLimit)).map((e) => e.score.toFixed(3) + " " + e.memory.title)), C;
	};
}
var rh = /* @__PURE__ */ new Map();
async function ih(e, t, n, r, i) {
	let a = "scene-diary", o = "vectors-" + al(JSON.stringify([
		t.space,
		n.endpoint,
		n.model,
		n.dimensions
	])), s = JSON.stringify([t, o]), c = rh.get(s), l = Promise.resolve(c).catch(() => {}).then(async () => {
		i?.throwIfAborted();
		let s = r.store, c = s ? await s.getJson({
			namespace: a,
			key: o
		}) || {} : null, l = c ? new Map(e.flatMap((e) => {
			let r = c[Pl(t, n, e)];
			return Array.isArray(r) ? [[e.id, r]] : [];
		})) : await Bl(e, t, n), u = e.filter((e) => !l.has(e.id));
		for (let e = 0; e < u.length; e += 16) {
			let a = u.slice(e, e + 16), o = await zl(a.map((e) => e.content), n, r.embeddingKey, { signal: i });
			i?.throwIfAborted(), s || await Vl(a, o, t, n), a.forEach((e, t) => l.set(e.id, o[t]));
		}
		if (s && (u.length || Object.keys(c).length !== l.size)) {
			let r = Object.fromEntries(e.map((e) => [Pl(t, n, e), l.get(e.id)]));
			await s.setJson({
				namespace: a,
				key: o,
				value: r
			});
		}
		return l;
	});
	rh.set(s, l);
	try {
		return await l;
	} finally {
		rh.get(s) === l && rh.delete(s);
	}
}
async function ah(e, t, n, r) {
	let i = eh(e), a = e.memories.filter(Xl), [o, s] = await Promise.all([e.settings.memoryTokenBudget && e.settings.recallLimit ? n(a, t, "事实") : [], e.settings.historyBudget ? n(i.history, t, "历史日记", { useImportance: !1 }) : []]), c = Qm(s.filter((t) => t.score >= e.settings.recallScoreThreshold).map((e) => e.memory), Infinity, e.settings.historyBudget, (e) => e.title + "\n" + e.content, $m("scene&diary 历史经历摘要")), l = th(a, o, e.edges, t, e.settings);
	for (let [e, t] of [
		["近期日记", i.full],
		["历史经历摘要", c],
		["事实及一跳关系", l]
	]) {
		let n = (e) => e.memory?.title || e.title;
		r({
			stage: e,
			status: "success",
			title: t.selected.length + " 条 · 约 " + t.cost + " token",
			details: [...t.selected.map((e) => [
				"注入",
				n(e),
				e.via,
				e.reason
			].filter(Boolean).join(" · ")), ...t.skipped.map((e) => "因数量／额度跳过 · " + n(e))]
		});
	}
	let u = e.settings.growthEnabled && e.characterGrowth.content.trim();
	return [
		u && $m("scene&diary 当前角色画像")([u]),
		i.full.content,
		c.content,
		l.content
	].filter(Boolean).join("\n\n");
}
function oh(e, t) {
	return ah(e, t, nh(e, {}, () => {}, null, { localOnly: !0 }), () => {});
}
// tasks-v7.js
var sh = { type: "string" }, ch = { type: ["string", "null"] }, lh = (e) => ({
	type: "array",
	items: e
}), uh = (e) => ({
	type: "string",
	enum: e
}), dh = (e) => ({
	type: "object",
	properties: e,
	required: Object.keys(e),
	additionalProperties: !1
}), fh = (e, t) => ({
	name: "scene_diary_" + e,
	value: dh(t)
}), ph = dh({
	category: uh(Object.keys(Kl)),
	title: sh,
	content: sh,
	people: lh(sh),
	aliases: lh(sh),
	importance: {
		type: "integer",
		minimum: 1,
		maximum: 5
	},
	storyTime: ch
}), mh = {
	diary: fh("diary_with_summary", {
		title: sh,
		body: sh,
		summary: sh
	}),
	growth: fh("growth_evaluation", {
		changed: { type: "boolean" },
		content: sh
	}),
	memory: fh("facts", { facts: lh(ph) }),
	decisions: fh("fact_decisions", { decisions: lh(dh({
		candidateId: sh,
		action: uh([
			"new",
			"duplicate",
			"supplement",
			"update"
		]),
		targetId: ch,
		content: sh
	})) }),
	summary: fh("summary", { summary: sh }),
	graph: fh("typed_edges", { edges: lh(dh({
		from: sh,
		to: sh,
		type: uh(Object.keys(ql)),
		reason: sh
	})) })
};
function hh(e, t) {
	if (!$(e)) throw Error(t + "为空，可重试或手动填写。");
	return $(e);
}
function gh(e, t) {
	return _l(e, {
		char: t.character.char,
		user: t.character.user
	});
}
var _h = "维护一份简洁的当前角色画像，聚焦仍然成立的人格、价值观、情感、信任、生活状态和重要经历的长期影响。结合初始设定，保留有证据的变化，避免按时间罗列或把日常写成成长。", vh = "摘要应保留经历的经过、关键互动和长期意义，方便日后找回脉络，约 150–300 字。独立、精准的事实由事实库整理。";
async function yh(e, t, n, r, i, a, o = t.settings) {
	if (e === "growth") {
		let e = n.results.diary.value, r = e.summary || e.body, s = Zm(t).slice(0, o.recentDiaryCount), c = new Set(s.map((e) => e.id)), l = (await a(Zm(t).filter((e) => !c.has(e.id) && !e.summaryPending).map((e) => ({
			id: e.id,
			title: e.title,
			content: e.summary
		})), r, "历史日记", { useImportance: !1 })).filter((e) => e.score >= o.recallScoreThreshold).slice(0, 3), u = [...s.map((e) => e.summaryPending ? e.body : e.summary), ...l.map((e) => e.memory.content)], d = await i("growth", [
			_h,
			gh(o.prompts.growth, n),
			"只有实质变化才返回 changed=true 及完整画像，否则 changed=false、content=\"\"。",
			"初始设定：" + n.character.context,
			"现画像：" + t.characterGrowth.content,
			"近期与相关历史：" + u.join("\n\n"),
			"已确认的本幕日记：" + e.body
		].join("\n\n"), mh.growth);
		return {
			changed: d.changed,
			content: d.changed ? hh(d.content, "候选画像") : ""
		};
	}
	let s = hl(r, o.extraction, n.character.char, n.character.user);
	if (s.errors.length) throw Error("正文或故事时间标签未匹配。" + s.errors.map((e) => "楼层 " + (e.index + 1) + " " + e.errors.join("、")).join("；"));
	if (e === "diary") {
		let e = await i("diary", [
			gh(o.prompts.diary, n),
			vh,
			"以角色第一人称保留情节、互动细节、关键对话与当时感受。正文目标长度 " + o.diaryTargetLength,
			"初始设定：" + n.character.context,
			"本幕对话：\n" + s.text
		].join("\n\n"), mh.diary);
		return {
			title: $(e.title) || "未命名日记",
			body: hh(e.body, "日记正文"),
			summary: hh(e.summary, "日记摘要")
		};
	}
	return xh(t, s, n, i, a, o);
}
var bh = (e) => ({
	id: e.id,
	category: e.category,
	title: e.title,
	content: e.content,
	storyTime: e.storyTime,
	locked: e.locked
});
async function xh(e, t, n, r, i, a) {
	let o = (await r("memory", [
		gh(a.prompts.memory, n),
		"提取四类可供后续直接使用的独立客观事实。忽略日常流水、愿望、推测、心理和未落实计划。无合格事实返回空数组。",
		"preference 偏好：主体、喜好或厌恶的对象。npc_relationship：NPC 与角色或玩家的客观关系。item：有用途、归属或特殊意义的物品。place：地点及可复用的位置、条件或用途。",
		"角色 " + n.character.char + "，玩家 " + n.character.user + "。故事时间仅使用对话中标出的时间。最多 30 条。",
		"本幕对话：\n" + t.text
	].join("\n\n"), mh.memory)).facts.slice(0, 30).map((e) => Zl(e)).filter(au), s = e.memories.filter(Xl), c = [];
	for (let e = 0; e < o.length; e += 4) {
		let t = o.slice(e, e + 4), n = await Promise.all(t.map(async (e) => ({
			candidate: e,
			existing: (await i(s, e.content, "事实", {
				includePermanent: !0,
				useImportance: !1
			})).filter((e) => e.score >= a.maintenanceScoreThreshold).slice(0, 5).map((e) => bh(e.memory))
		})));
		c.push(...n);
	}
	let l = /* @__PURE__ */ new Map();
	for (let e = 0; e < c.length; e += 8) {
		let t = c.slice(e, e + 8).filter((e) => e.existing.length);
		if (!t.length) continue;
		let n = await r("memory", [
			"对照每个候选对应的已有事实。每个候选使用 candidateId 输出一个判断：new 新事实；duplicate 同义重复；supplement 同一事实的补充；update 已发生的状态变化。",
			"new 的 targetId 为 null，其余只允许使用该候选所列的已有 ID。补充或变化的 content 写出应用后的完整客观事实。",
			JSON.stringify(t.map(({ candidate: e, existing: t }) => ({
				...bh(e),
				existing: t
			})))
		].join("\n\n"), mh.decisions);
		for (let e of t) {
			let t = n.decisions.find((t) => t.candidateId === e.candidate.id);
			if (!t || t.action !== "new" && !e.existing.some((e) => e.id === t.targetId)) throw Error("事实判定遗漏候选或引用了无效目标，可重试此项。");
			l.set(e.candidate.id, t);
		}
	}
	return c.map(({ candidate: e, existing: t }) => {
		let n = l.get(e.id), r = n?.action || "new", i = r === "new" ? null : n.targetId, a = t.find((e) => e.id === i);
		return {
			id: Vc("proposal"),
			action: r,
			targetId: i,
			targetContent: a?.content,
			targetStoryTime: a?.storyTime,
			value: {
				...e,
				content: ["supplement", "update"].includes(r) ? hh(n.content, "拟更新事实") : e.content
			},
			accepted: r !== "duplicate" && !a?.locked
		};
	});
}
function Sh(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of t.filter((e) => e.accepted && e.action !== "duplicate")) {
		if (!au(r.value)) throw Error("已接受的事实必须分类并填写标题和正文。");
		let t = r.targetId;
		if (t) {
			if (n.has(t)) throw Error("同一事实有多条已接受的修改，请只保留一条。");
			let i = e.memories.find((e) => e.id === t);
			if (!Xl(i) || i.locked) throw Error("修改目标已删除、未分类或已锁定，请重新审核。");
			if (r.targetContent !== i.content || r.targetStoryTime !== (i.storyTime ?? null)) throw Error("目标事实已修改，请重新提取或拒绝此建议。");
			n.add(t), ou(e, {
				title: r.value.title,
				content: r.value.content,
				storyTime: r.value.storyTime || i.storyTime,
				people: [...i.people, ...r.value.people],
				aliases: [...i.aliases, ...r.value.aliases]
			}, t);
		} else e.memories.some((e) => Xl(e) && e.category === r.value.category && e.content.trim().toLocaleLowerCase() === r.value.content.trim().toLocaleLowerCase()) || ou(e, r.value);
	}
}
async function Ch(e, t) {
	return hh((await t("summary", vh + "\n标题：" + e.title + "\n正文：\n" + e.body, mh.summary)).summary, "日记摘要");
}
function wh(e, t = 12e3) {
	let n = [];
	for (let r = 0; r < e.length; r += t) n.push(e.slice(r, r + t));
	return n;
}
async function Th(e, t) {
	return hh((await t("growth", "概括这批叙事材料中与持久人物状态有关的事实与变化，约 800 字。把阶段性变化与当前状态区分。输出 summary。\n" + e, mh.summary)).summary, "成长归纳");
}
async function Eh(e, t, n, r) {
	let i = Zm(e).reverse();
	if (!i.length) throw Error("请先保存至少一篇有效日记。");
	let a = wh(i.map((e) => e.title + "\n" + e.body).join("\n\n")), o = 1;
	for (; a.length > 1;) {
		let e = [];
		for (let t of a) r("归纳第 " + o + " 层，第 " + (e.length + 1) + "/" + a.length + " 批"), e.push(await Th(t, n));
		if (o++, e.join("\n\n").length >= a.join("\n\n").length) throw Error("归纳内容未缩短，请以较小的渠道输出额度重试。");
		a = wh(e.join("\n\n"));
	}
	let s = await n("growth", [
		_h,
		"覆盖全部提供的历史素材，形成一份完整画像。现画像用于核对。",
		"初始设定：" + t.context,
		"现画像：" + e.characterGrowth.content,
		"日记材料：\n" + a[0]
	].join("\n\n"), mh.growth);
	return hh(s.changed ? s.content : e.characterGrowth.content, "重整画像");
}
var Dh = (e) => al(JSON.stringify(bh(e)));
async function Oh(e, t, n, r, i) {
	let a = e.memories.filter(Xl), o = Object.fromEntries(a.map((e) => [e.id, Dh(e)])), s = t === "full" ? a : a.filter((t) => e.graphReviewed[t.id] !== o[t.id]), c = new Map(a.map((e) => [e.id, e])), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = new Set(e.edges.map(ru));
	for (let t = 0; t < s.length; t++) {
		let n = s[t];
		i("检索候选 " + (t + 1) + "/" + s.length);
		let o = await r(a, n.content, "事实", {
			includePermanent: !0,
			excludeId: n.id,
			useImportance: !1
		});
		for (let t of o.filter((t) => t.memory.id !== n.id && t.score >= e.settings.maintenanceScoreThreshold).slice(0, e.settings.maintenanceCandidateLimit)) {
			let e = [n.id, t.memory.id].sort();
			l.set(JSON.stringify(e), e);
		}
	}
	let f = [...l.values()];
	for (let r = 0; r < f.length; r += 8) {
		let o = f.slice(r, r + 8), s = new Set(o.map((e) => JSON.stringify(e)));
		i("整理候选 " + (r + 1) + "–" + (r + o.length) + "/" + f.length);
		let l = await n("graph", [
			e.settings.prompts.maintenance,
			"仅用所给事实对提议有证据且有助于精准检索的有向关系。同人、同地点、同话题不足以建边。没有明确关系返回空数组。",
			"from 与 to 使用真实 ID。必须用 reason 说明两个已有事实如何支持该方向。",
			JSON.stringify(Object.fromEntries(Object.entries(ql).map(([e, t]) => [e, t.meaning]))),
			JSON.stringify(o.map((e) => e.map((e) => bh(c.get(e)))))
		].join("\n\n"), mh.graph);
		for (let e of iu(l.edges, a)) s.has(JSON.stringify([e.from, e.to].sort())) && (t === "incremental" && d.has(ru(e)) || u.set(ru(e), {
			...e,
			accepted: !0
		}));
	}
	return {
		mode: t,
		edges: [...u.values()],
		reviewed: o,
		revision: e.memoryRevision
	};
}
// host-v7.js
var kh = "0.4.0", Ah = (e) => ["confirmed", "skipped"].includes(e?.status);
async function jh(e, t, n = 0, r = !1, i = !1) {
	if (!t || !r && Number.isInteger(n) && e.length > n && e.slice(n).every(Boolean)) return e;
	let a = await t.tail({ limit: 100 }), o = a.startIndex + a.messages.length, s = Math.max(0, o - e.length), c = [], l = /* @__PURE__ */ new Map();
	for (e.forEach((e, t) => {
		if (!e) return;
		let n = t + s;
		c[n] = e, i && e.tt_swipe_cold && l.set(e.tt_swipe_cold.record - 1, n);
	});;) {
		for (let e = 0; e < a.messages.length; e++) {
			let t = a.startIndex + e, n = a.messages[e];
			if (c[t] ||= n, l.has(t)) {
				let e = l.get(t), { tt_swipe_cold: r, ...i } = c[e], a = (e, t) => e?.map((e, n) => e ?? t?.[n]) || t;
				c[e] = {
					...i,
					swipes: a(i.swipes, n.swipes),
					swipe_info: a(i.swipe_info, n.swipe_info)
				}, l.delete(t);
			}
		}
		if (!a.hasMoreBefore || a.startIndex <= n) {
			if (l.size) throw Error("无法读取完整的历史候选回复。");
			return c;
		}
		a = await t.before(a, { limit: 100 });
	}
}
function Mh(e, t, n = globalThis) {
	let r = () => e(), i = () => r().chatMetadata, a = () => String(r().chatId ?? ""), o = () => r().chat || [], s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map(), l = () => n.SillyTavern?.libs?.localforage, u = Vc("account"), d = () => {
		let e = r().accountStorage, t = e?.getItem("scene_diary_account_id") || u;
		return e?.getItem("scene_diary_account_id") || e?.setItem("scene_diary_account_id", t), t;
	}, f = null, p = Promise.resolve(), m = "", h = !1, g = 0, _ = "", v = [], y = "", b, x = 0, S = "", C = "", ee = "", w = null, te = async () => {
		let e = n.__TAURITAVERN__;
		return e ? (await e.ready, e.api?.chat?.current?.handle?.()) : null;
	}, T = (e) => !!e && f === e && e.id === a() && e.metadata === i(), E = () => f && T(f) && !_ ? i()?.[Pc] : null, ne = () => E() || i()?.scene_diary, D = () => ({
		state: E(),
		persisted: ne(),
		chatId: a(),
		blocker: _,
		saveError: m,
		saved: h,
		pendingSaves: g,
		trace: v,
		graphProgress: S,
		growthProgress: C,
		summaryProgress: ee,
		growthPreview: w,
		busy: [...c.keys()],
		channels: cp(r()),
		messages: o().length
	}), O = () => s.forEach((e) => e(D()));
	function k(e) {
		if (!e || !T(e)) throw new DOMException("聊天已切换", "AbortError");
	}
	function re(e = !1) {
		let t = f;
		e && t.messageRevision++, g++, O();
		let n = p.then(async () => {
			if (!T(t)) return !1;
			let e = r(), n = t.messageRevision, i = n === t.savedMessageRevision ? e.saveMetadata || e.saveChat : e.saveChat || e.saveMetadata;
			if (!i) throw Error("宿主保存接口不可用。");
			return await i(), T(t) && (t.savedMessageRevision = n, m = "", h = !0), T(t);
		});
		return p = n.catch((e) => {
			T(t) && (m = e.message, h = !1);
		}).finally(() => {
			T(t) && (g--, O());
		}), n;
	}
	function A(e, t = !1) {
		let n = E();
		if (!n) throw Error("请先打开受支持的聊天。");
		let r = structuredClone(n), a = e(r);
		return r.lastUpdatedAt = Date.now(), i()[Pc] = r, O(), re(t).then(() => a);
	}
	function j(e) {
		return "scene_diary_migration_backup_" + d() + "_" + a() + "_schema" + e + "_to7";
	}
	async function ie() {
		let e = a(), s = i(), u = ++x;
		if (f?.id !== e || f?.metadata !== s) {
			for (let e of c.values()) e.abort();
			c.clear(), b?.abort(), f = {
				id: e,
				metadata: s,
				messageRevision: 0,
				savedMessageRevision: 0
			}, m = "", h = !1, g = 0, v = [], y = "", S = "", C = "", ee = "", w = null, t("");
		}
		let p = f;
		if (!e || r().groupId || !s) {
			_ = "请选择一个单角色聊天。", O();
			return;
		}
		if (n.AutoCardUpdaterAPI) {
			_ = "检测到 SP·数据库，请停用 SP 并刷新后使用本扩展。", t(""), O();
			return;
		}
		let E = s[Pc];
		if (E?.version > 7) _ = "聊天数据版本高于 0.4.0，请使用对应的插件版本。", O();
		else if (E && E.version !== 7) {
			_ = "正在备份旧聊天…", O();
			try {
				let t = j(E.version), n = await te(), r = await jh(o(), n?.history, 0, !0, !0);
				if (!T(p) || u !== x || (await l().getItem(t) || await l().setItem(t, {
					schema: E.version,
					savedAt: Date.now(),
					metadata: structuredClone(s),
					messages: structuredClone(r),
					pendingRecovery: E.memorySpaceId ? await l().getItem("scene_diary_recovery_" + d() + "_" + e + "_" + E.memorySpaceId) : null
				}), !T(p) || u !== x || s.scene_diary !== E)) return;
				s[Pc] = tu(E), _ = "", await re();
			} catch (e) {
				T(p) && s.scene_diary === E && (_ = "迁移备份失败，旧聊天仍保留。" + e.message, O());
			}
		} else if (!E && o().filter(cl).length > 1) _ = "已有聊天，请选择开始接管的楼层。", O();
		else {
			if (_ = "", !E) await ae(0);
			else {
				let e = E.pendingTransaction;
				e && Yl.some((t) => e.results[t]?.status === "running" && !c.has("close:" + t)) && await A((e) => {
					for (let t of Yl) {
						let n = e.pendingTransaction.results[t];
						n?.status === "running" && !c.has("close:" + t) && (n.status = "error", n.error = "请求已中断，可单独重试本项。");
					}
				}), E.status === "active" && o().some((e) => cl(e) && !e.extra?.scene_diary?.actId) && await A((e) => o().forEach((t, n) => {
					cl(t) && !t.extra?.scene_diary?.actId && ll(e, t, e.currentActId, n);
				}), !0);
			}
			O();
		}
	}
	async function ae(e) {
		if (n.AutoCardUpdaterAPI || r().groupId || !a() || i()?.scene_diary) return;
		_ = "";
		let t = eu();
		o().forEach((n, r) => {
			r >= e && cl(n) && ll(t, n, 1, r);
		}), rl(t).startMessageIndex = e, i()[Pc] = t, await re(!0);
	}
	async function oe(e, t) {
		if (!e.messageIds.length) return [];
		let n = o(), r = new Set(e.messageIds), i = (t) => t.filter((t) => cl(t) && Number(t.extra?.scene_diary?.actId) === e.id && r.has(t.extra?.scene_diary?.messageId)), a = i(n);
		if (a.length === r.size) return a;
		let s = await te();
		if (k(t), !s?.history) return a;
		let c = await jh(n, s.history, 0, !0);
		return k(t), n.every(Boolean) && c.length <= n.length ? a : i(c);
	}
	function se() {
		let e = r(), t = e.getCharacterCardFields?.() || {};
		return {
			char: e.name2 || t.name || "角色",
			user: e.name1 || "玩家",
			context: vl(t)
		};
	}
	async function ce() {
		let e = f, t = E(), n = rl(t);
		if (!n || t.status !== "active") return;
		let r = await oe(n, e);
		if (!r.length) throw Error("本幕没有可整理的对话。");
		if (k(e), E() !== t) throw Error("当前幕已变化，请重新结束本幕。");
		await A((e) => {
			e.status = "preview", rl(e).status = "closing", e.pendingTransaction = {
				id: Vc("close"),
				actId: n.id,
				sourceFingerprint: ol(r),
				character: se(),
				growthRevision: e.characterGrowth.revision,
				results: Object.fromEntries(Yl.map((e) => [e, { status: "idle" }]))
			};
		}), await Promise.allSettled([me("diary"), me("memory")]);
	}
	function le(e) {
		if (c.has(e)) return null;
		let t = new AbortController();
		return c.set(e, t), O(), t;
	}
	function ue(e, t) {
		c.get(e) === t && (c.delete(e), O());
	}
	let de = (e, t) => {
		T(e) && (v.push(t), v.length > 100 && v.shift(), O());
	};
	function fe(e, t, n, i) {
		let a = new Map(cp(r()).map((e) => [e.id, structuredClone(e)]));
		return (o, s, c) => {
			k(n), t.throwIfAborted();
			let l = a.get(e.settings.bindings[o]);
			if (!l) throw Error("请在设置中为「" + Jl[o] + "」绑定自建渠道。");
			return _p(r(), l, s, c, t, Jl[o], i);
		};
	}
	async function pe(e, t, n, i) {
		let a = await te();
		k(t);
		let o = r().accountStorage;
		return nh(e, {
			chat: t.id,
			account: d(),
			store: a?.store,
			embeddingKey: o?.getItem("scene_diary_embedding_key") || "",
			rerankKey: o?.getItem("scene_diary_rerank_key") || ""
		}, (e) => de(t, e), n, i);
	}
	async function me(e) {
		let t = f, n = E(), r = n?.pendingTransaction;
		if (!r || !Yl.includes(e) || e === "growth" && r.results.diary.status !== "confirmed") return;
		let i = "close:" + e, a = le(i);
		if (!a) return;
		let o = a.signal, s = fe(n, o, t, (n) => de(t, {
			stage: Jl[e],
			title: n
		})), l = r.results[e], u = () => T(t) && E()?.pendingTransaction?.id === r.id && c.get(i) === a;
		try {
			let i = structuredClone(await oe(rl(n), t));
			if (o.throwIfAborted(), !u() || ol(i) !== r.sourceFingerprint) throw Error("本幕对话已经修改，请取消关幕后重开审核。");
			if (e === "growth" && E().pendingTransaction.results.diary !== r.results.diary && JSON.stringify(E().pendingTransaction.results.diary) !== JSON.stringify(r.results.diary)) throw Error("已确认日记已变化，请重新评估成长。");
			e === "diary" && c.get("close:growth")?.abort(), await A((t) => {
				t.pendingTransaction.results[e] = {
					...l,
					status: "running",
					error: ""
				}, e === "diary" && he(t.pendingTransaction);
			}), o.throwIfAborted();
			let a = await yh(e, n, r, i, s, await pe(n, t, o));
			if (!u()) return;
			if (o.throwIfAborted(), e !== "growth" && ol(await oe(rl(E()), t)) !== r.sourceFingerprint) throw Error("本幕对话已经修改，请取消关幕后重开审核。");
			if (!u()) return;
			o.throwIfAborted(), await A((t) => {
				t.pendingTransaction.results[e] = {
					status: "draft",
					value: a
				}, e === "growth" && (t.pendingTransaction.growthRevision = n.characterGrowth.revision);
			}).catch(() => {});
		} catch (t) {
			if (!u()) return;
			let n = E().pendingTransaction.results[e];
			if (n.status === "outdated" || n.status === "skipped") return;
			await A((n) => {
				n.pendingTransaction.results[e] = {
					...l,
					status: "error",
					error: t.message
				};
			}).catch(() => {});
		} finally {
			ue(i, a);
		}
	}
	function he(e) {
		let t = e.results.growth;
		e.results.growth = t.value ? {
			...t,
			status: "outdated"
		} : { status: "idle" };
	}
	async function ge(e, t, n = !1, r = !0) {
		if (c.has("close:" + e) || !Yl.includes(e)) return;
		let i = E()?.pendingTransaction;
		if (!i || e === "growth" && i.results.diary.status !== "confirmed") return;
		if (!n && t == null) throw Error("请填写或生成审核内容。");
		if (r && !n && e === "diary" && (!$(t.body) || !$(t.summary))) throw Error("请填写日记正文和摘要。");
		if (r && !n && e === "growth" && t.changed && !$(t.content)) throw Error("请填写候选画像。");
		let a = e === "diary" && (n || !r || i.results.diary.status !== "confirmed" || JSON.stringify(i.results.diary.value) !== JSON.stringify(t));
		if (a && c.get("close:growth")?.abort(), e === "growth" && r && !n && i.results.growth.value && i.growthRevision !== E().characterGrowth.revision) throw Error("当前画像已修改，请重新评估成长。");
		await A((i) => {
			let o = i.pendingTransaction;
			o.results[e] = n ? { status: "skipped" } : {
				status: r ? "confirmed" : "draft",
				value: t
			}, e === "diary" && (n ? o.results.growth = { status: "skipped" } : a && he(o)), e === "growth" && (o.growthRevision = i.characterGrowth.revision);
		}), e === "diary" && !n && r && ["idle", "outdated"].includes(E()?.pendingTransaction?.results.growth.status) && await me("growth");
	}
	async function _e() {
		let e = f, t = E(), n = t?.pendingTransaction;
		if (!n || !Yl.every((e) => Ah(n.results[e]))) throw Error("请先处理三项审核。");
		let r = await oe(rl(t), e);
		if (k(e), E() !== t) throw Error("审核内容已变化，请重试提交。");
		if (ol(r) !== n.sourceFingerprint) throw Error("本幕来源已变化，请取消后重新整理。");
		await A((e) => {
			let t = rl(e), { diary: i, growth: a, memory: o } = n.results;
			if (a.status === "confirmed" && e.characterGrowth.revision !== n.growthRevision) throw Error("当前画像已修改，请重新评估成长。");
			o.status === "confirmed" && Sh(e, o.value), i.status === "confirmed" && e.diaries.push(Ql({
				...i.value,
				createdAt: Date.now()
			})), a.status === "confirmed" && a.value.changed && nu(e, a.value.content, {
				actId: t.id,
				edited: !1
			}), Object.assign(t, {
				status: "closed",
				closedAt: Date.now(),
				sourceFingerprint: n.sourceFingerprint,
				startMessageIndex: r[0]?.extra?.scene_diary?.messageIndex ?? t.startMessageIndex,
				endMessageIndex: r.at(-1)?.extra?.scene_diary?.messageIndex ?? t.endMessageIndex
			}), e.status = "pending_next_act", e.pendingTransaction = null;
		});
	}
	function ve() {
		for (let e of Yl) {
			let t = "close:" + e;
			c.get(t)?.abort(), c.delete(t);
		}
		return A((e) => {
			rl(e).status = "active", e.status = "active", e.pendingTransaction = null;
		});
	}
	async function ye(e) {
		let t = f, n = E(), r = "summary", i = n && le(r);
		if (!i || !n) return;
		let a = fe(n, i.signal, t), o = n.diaries.filter((t) => e.includes(t.id));
		try {
			for (let e of o) {
				ee = "正在整理 " + e.title, O();
				let n = await Ch(e, a);
				i.signal.throwIfAborted(), k(t), await A((t) => {
					let r = t.diaries.find((t) => t.id === e.id);
					if (r?.body !== e.body) throw Error("日记已编辑，请重新生成摘要。");
					Object.assign(r, {
						summary: n,
						summaryPending: !1,
						updatedAt: Date.now()
					});
				});
			}
		} finally {
			T(t) && (ee = ""), ue(r, i);
		}
	}
	async function be() {
		let e = f, t = E(), n = "growth", r = t && le(n);
		if (r && t) try {
			let n = await Eh(t, se(), fe(t, r.signal, e), (t) => {
				T(e) && (C = t, O());
			});
			k(e), r.signal.throwIfAborted(), w = {
				content: n,
				revision: t.characterGrowth.revision,
				diaries: JSON.stringify(t.diaries)
			};
		} finally {
			T(e) && (C = ""), ue(n, r);
		}
	}
	async function xe(e) {
		w && (await A((t) => {
			if (t.characterGrowth.revision !== w.revision || JSON.stringify(t.diaries) !== w.diaries) throw Error("画像或日记已变化，请重新重整。");
			if (!$(e)) throw Error("请填写候选画像。");
			nu(t, e);
		}), w = null, O());
	}
	async function Se(e) {
		let t = f, n = E(), r = "graph", i = n && le(r);
		if (!i || !n) return;
		let a = fe(n, i.signal, t);
		try {
			let r = await Oh(n, e, a, await pe(n, t, i.signal, { strict: !0 }), (e) => {
				T(t) && (S = e, O());
			});
			k(t), i.signal.throwIfAborted(), await A((e) => {
				e.graphPreview = r;
			});
		} finally {
			T(t) && (S = ""), ue(r, i);
		}
	}
	function Ce(e) {
		return A((t) => {
			let n = t.graphPreview;
			if (!n || t.memoryRevision !== n.revision) throw Error("事实库已变化，请重新整理图谱。");
			let r = e.filter((e) => e.accepted), i = iu(r, t.memories);
			if (i.length !== r.length) throw Error("存在重复或无效关系，请检查关系端点、类型和依据。");
			t.edges = iu(n.mode === "full" ? i : [...t.edges, ...i], t.memories), t.graphReviewed = n.reviewed, t.graphPreview = null;
		});
	}
	async function we(e, i, a) {
		t(""), y = "";
		let s = E(), c = f;
		if (!s || n.AutoCardUpdaterAPI || !["active", "preview"].includes(s.status) || !Array.isArray(e)) return;
		b?.abort();
		let l = (b = new AbortController()).signal;
		v = [];
		try {
			let i = gl(o().filter(cl).slice(-s.settings.recallMessageCount), s.settings.extraction);
			if (i.errors.length) throw Error("最近对话正文标签未匹配，请检查正文提取设置。");
			let a = await pe(s, c, l), u = await ah(s, i.text, a, (e) => de(c, e));
			if (k(c), l.throwIfAborted(), !["active", "preview"].includes(E()?.status) || E()?.currentActId !== s.currentActId) throw new DOMException("当前剧幕已变化", "AbortError");
			if (E() !== s) throw Error("聊天内容已更新，请重新生成。");
			e.splice(0, e.length, ...dl(e, s.currentActId)), String(r().mainApi).toLowerCase() === "openai" ? y = u : t(u, Math.min(e.length, 100)), v.some((e) => e.status === "warning") && n.toastr?.warning?.("语义召回部分失败，详情见 scene&diary 诊断。");
		} catch (e) {
			if (!l.aborted && T(c)) {
				let t = Il(e);
				de(c, {
					stage: "召回",
					status: "error",
					title: t
				}), n.toastr?.error?.(t);
			}
			a?.(!0);
		}
	}
	async function Te(e) {
		let t = E();
		if (!t || n.AutoCardUpdaterAPI || !["active", "preview"].includes(t.status) || !Array.isArray(e.chat)) return;
		let r = y;
		if (y = "", !e.dryRun) {
			Sl(e.chat, r);
			return;
		}
		let i = gl(o().filter(cl).slice(-t.settings.recallMessageCount), t.settings.extraction);
		if (i.errors.length) return;
		let a = await oh(t, i.text);
		E() === t && Sl(e.chat, a);
	}
	function Ee(e, t) {
		let n = E(), r = o()[Number(e)];
		if (n && cl(r) && !!r.is_user === t && (["active", "preview"].includes(n.status) || t && n.status === "pending_next_act")) return A((t) => {
			t.status === "pending_next_act" ? ul(t, r, Number(e)) : ll(t, r, t.currentActId, Number(e));
		}, !0);
	}
	function De(e) {
		let t = E(), n = o()[Number(e)]?.extra?.scene_diary?.actId;
		if (!(!t || !t.diaries.length || n && t.acts.find((e) => e.id === n)?.status !== "closed" || t.characterGrowth.reviewRecommended)) return A((e) => {
			e.characterGrowth.reviewRecommended = !0;
		});
	}
	function Oe() {
		let e = r(), i = e.eventTypes || {}, a = (t, r, a) => e.eventSource?.on(i[t] || r, (...e) => {
			try {
				return Promise.resolve(a(...e)).catch((e) => {
					m || n.toastr?.error?.(e.message);
				});
			} catch (e) {
				n.toastr?.error?.(e.message);
			}
		});
		return a("CHAT_CHANGED", "chat_id_changed", ie), a("CHAT_LOADED", "chatLoaded", ie), a("MESSAGE_SENT", "message_sent", (e) => Ee(e, !0)), a("MESSAGE_RECEIVED", "message_received", (e) => Ee(e, !1)), a("MESSAGE_EDITED", "message_edited", De), a("MESSAGE_UPDATED", "message_updated", De), a("MESSAGE_SWIPED", "message_swiped", De), a("MESSAGE_DELETED", "message_deleted", () => De()), a("CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready", Te), a("GENERATION_STOPPED", "generation_stopped", () => {
			b?.abort(), y = "", t("");
		}), ie();
	}
	return {
		snapshot: D,
		subscribe(e) {
			return s.add(e), e(D()), () => s.delete(e);
		},
		connect: Oe,
		initialize: ie,
		takeOver: ae,
		mutate: A,
		save: re,
		getContext: e,
		rearrange: we,
		promptReady: Te,
		openClose: ce,
		runClose: me,
		reviewPart: ge,
		confirmClose: _e,
		cancelClose: ve,
		organize: Se,
		applyGraph: Ce,
		generateGrowth: be,
		acceptGrowth: xe,
		discardGrowth() {
			w = null, O();
		},
		summarizeAll: ye,
		cancel(e) {
			c.get(e)?.abort();
		},
		refresh: O,
		backup: () => lu(E(), a()),
		import: (e) => A((t) => Object.assign(t, uu(t, e, a()))),
		migrationBackup: async () => {
			for (let e = 6; e > 0; e--) {
				let t = await l()?.getItem(j(e));
				if (t) return t;
			}
			throw Error("这个聊天没有迁移备份。");
		},
		cancelRecall() {
			b?.abort(), y = "", t("");
		}
	};
}
// src/index.ts
function Nh(e, t) {
	let n = Mh(e, t);
	Object.assign(globalThis, {
		sceneDiaryRearrangeChat: n.rearrange,
		sceneDiary: {
			version: kh,
			...n
		}
	});
	let r = () => {
		if (document.getElementById("scene-diary-root")) return;
		let e = document.createElement("div");
		e.id = "scene-diary-root", document.body.append(e);
		let t = Hl(n);
		Oc(Xm).provide(Ul, t).mount(e);
		let r = document.getElementById("send_but");
		if (r) {
			let e = document.createElement("button");
			e.className = "sd-host-entry", e.type = "button", e.title = "打开 scene&diary 剧幕工作台", e.setAttribute("aria-label", e.title), e.innerHTML = "<i class=\"fa-solid fa-clapperboard\" aria-hidden=\"true\"></i>", e.addEventListener("click", t.openWorkbench), r.before(e), t.hasToolbar.value = !0;
		}
		t.run(n.connect);
	};
	document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r, { once: !0 }) : r();
}
export { Nh as install };

// node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function e(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var t = {}, n = [], r = () => {}, i = () => !1, a = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), o = (e) => e.startsWith("onUpdate:"), s = Object.assign, c = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => x(e) === "[object Map]", p = (e) => x(e) === "[object Set]", m = (e) => x(e) === "[object Date]", h = (e) => typeof e == "function", g = (e) => typeof e == "string", _ = (e) => typeof e == "symbol", v = (e) => typeof e == "object" && !!e, y = (e) => (v(e) || h(e)) && h(e.then) && h(e.catch), b = Object.prototype.toString, x = (e) => b.call(e), S = (e) => x(e).slice(8, -1), C = (e) => x(e) === "[object Object]", w = (e) => g(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, T = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), ee = 1e4, te = (e) => {
	let t = /* @__PURE__ */ Object.create(null), n = 0;
	return ((r) => {
		let i = t[r];
		return i === void 0 ? (++n > ee && (t = /* @__PURE__ */ Object.create(null), n = 1), t[r] = e(r)) : i;
	});
}, E = /-\w/g, D = /* @__PURE__ */ te((e) => e.replace(E, (e) => e.slice(1).toUpperCase())), ne = /\B([A-Z])/g, O = /* @__PURE__ */ te((e) => e.replace(ne, "-$1").toLowerCase()), k = /* @__PURE__ */ te((e) => e.charAt(0).toUpperCase() + e.slice(1)), A = /* @__PURE__ */ te((e) => e ? `on${k(e)}` : ""), j = (e, t) => !Object.is(e, t), M = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, re = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, ie = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, ae, oe = () => ae ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function se(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? de(r) : se(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	}
	if (g(e) || v(e)) return e;
}
var ce = /;(?![^(]*\))/g, le = /:([^]+)/, ue = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function de(e) {
	let t = {};
	return e.replace(ue, (e) => e.startsWith("/*") ? "" : e).split(ce).forEach((e) => {
		if (e) {
			let n = e.split(le);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function fe(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = fe(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var pe = /* @__PURE__ */ e("itemscope,allowfullscreen,disablepictureinpicture,disableremoteplayback,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly");
function me(e) {
	return !!e || e === "";
}
function he(e, t, n) {
	if (e.length !== t.length) return !1;
	let r = !0;
	for (let i = 0; r && i < e.length; i++) r = ye(e[i], t[i], n);
	return r;
}
function ge(e, t, n) {
	if (e.size !== t.size) return !1;
	let r = Array.from(t), i = new Uint8Array(r.length);
	for (let t of e) {
		let e = -1;
		for (let a = 0; a < r.length; a++) if (!i[a] && ye(t, r[a], n)) {
			e = a;
			break;
		}
		if (e < 0) return !1;
		i[e] = 1;
	}
	return !0;
}
function _e(e, t, n) {
	let r = f(e), i = f(t);
	if (r || i || (r = p(e), i = p(t), r || i)) return r && i ? ge(e, t, n) : !1;
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let r in e) {
		let i = u(e, r), a = u(t, r);
		if (i && !a || !i && a || !ye(e[r], t[r], n)) return !1;
	}
	return xe(e) === xe(t);
}
function ve(e, t, n, r) {
	n ||= [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
	let [i, a] = n;
	if (i.has(e) || a.has(t)) return i.get(e) === t && a.get(t) === e;
	i.set(e, t), a.set(t, e);
	let o = r(e, t, n);
	return i.delete(e), a.delete(t), o;
}
function ye(e, t, n) {
	if (e === t) return !0;
	let r = m(e), i = m(t);
	return r || i ? r && i ? e.getTime() === t.getTime() : !1 : (r = _(e), i = _(t), r || i ? e === t : (r = d(e), i = d(t), r || i ? r && i ? ve(e, t, n, he) : !1 : (r = v(e), i = v(t), r || i ? !r || !i ? !1 : ve(e, t, n, _e) : String(e) === String(t))));
}
function be(e, t) {
	return e.findIndex((e) => ye(e, t));
}
function xe(e) {
	return Object.getPrototypeOf(e) === null && e[Symbol.toPrimitive] == null && typeof e.toString != "function" && typeof e.valueOf != "function" ? x(e) : String(e);
}
var Se = (e) => !!(e && e.__v_isRef === !0), N = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? Se(e) ? N(e.value) : JSON.stringify(e, Ce, 2) : String(e), Ce = (e, t) => Se(t) ? Ce(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[we(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => we(e)) } : _(t) ? we(t) : v(t) && !d(t) && !C(t) ? String(t) : t, we = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, P, Te = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && P && (P.active ? (this.parent = P, this.index = (P.scopes || (P.scopes = [])).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
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
			let t = P;
			try {
				return P = this, e();
			} finally {
				P = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = P, P = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (P === this) P = this.prevScope;
			else {
				let e = P;
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
function Ee() {
	return P;
}
var F, De = /* @__PURE__ */ new WeakSet(), Oe = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, P && (P.active ? P.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, De.has(this) && (De.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Me(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Ge(this), Fe(this);
		let e = F, t = Ve;
		F = this, Ve = !0;
		try {
			return this.fn();
		} finally {
			Ie(this), F = e, Ve = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) ze(e);
			this.deps = this.depsTail = void 0, Ge(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? De.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Le(this) && this.run();
	}
	get dirty() {
		return Le(this);
	}
}, ke = 0, Ae, je;
function Me(e, t = !1) {
	e.flags |= 8, t ? (e.next = je, je = e) : (e.next = Ae, Ae = e);
}
function Ne() {
	ke++;
}
function Pe() {
	if (--ke > 0) return;
	if (je) {
		let e = je;
		for (je = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; Ae;) {
		let t = Ae;
		for (Ae = void 0; t;) {
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
function Fe(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ie(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), ze(r), Be(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Le(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Re(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Re(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ke) || (e.globalVersion = Ke, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Le(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = F, r = Ve;
	F = e, Ve = !0;
	try {
		Fe(e);
		let n = e.fn(e._value);
		(t.version === 0 || j(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		F = n, Ve = r, Ie(e), e.flags &= -3;
	}
}
function ze(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) ze(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function Be(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var Ve = !0, He = [];
function Ue() {
	He.push(Ve), Ve = !1;
}
function We() {
	let e = He.pop();
	Ve = e === void 0 || e;
}
function Ge(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = F;
		F = void 0;
		try {
			t();
		} finally {
			F = e;
		}
	}
}
var Ke = 0, qe = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Je = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!F || !Ve || F === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== F) t = this.activeLink = new qe(F, this), F.deps ? (t.prevDep = F.depsTail, F.depsTail.nextDep = t, F.depsTail = t) : F.deps = F.depsTail = t, Ye(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = F.depsTail, t.nextDep = void 0, F.depsTail.nextDep = t, F.depsTail = t, F.deps === t && (F.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, Ke++, this.notify(e);
	}
	notify(e) {
		Ne();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Pe();
		}
	}
};
function Ye(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Ye(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Xe = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ Symbol(""), Qe = /* @__PURE__ */ Symbol(""), $e = /* @__PURE__ */ Symbol("");
function I(e, t, n) {
	if (Ve && F) {
		let t = Xe.get(e);
		t || Xe.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Je()), r.map = t, r.key = n), r.track();
	}
}
function et(e, t, n, r, i, a) {
	let o = Xe.get(e);
	if (!o) {
		Ke++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (Ne(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && w(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === $e || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get($e)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Ze)), f(e) && s(o.get(Qe)));
				break;
			case "delete":
				i || (s(o.get(Ze)), f(e) && s(o.get(Qe)));
				break;
			case "set": f(e) && s(o.get(Ze));
		}
	}
	Pe();
}
function tt(e) {
	let t = /* @__PURE__ */ L(e);
	return t === e || (I(t, "iterate", $e), /* @__PURE__ */ Vt(e)) ? t : /* @__PURE__ */ Bt(e) ? /* @__PURE__ */ zt(e) ? t.map((e) => Gt(Wt(e))) : t.map(Gt) : t.map(Wt);
}
function nt(e) {
	return I(e = /* @__PURE__ */ L(e), "iterate", $e), e;
}
function rt(e, t) {
	return /* @__PURE__ */ Bt(e) ? Gt(/* @__PURE__ */ zt(e) ? Wt(t) : t) : Wt(t);
}
var it = {
	__proto__: null,
	[Symbol.iterator]() {
		return at(this, Symbol.iterator, (e) => rt(this, e));
	},
	concat(...e) {
		return tt(this).concat(...e.map((e) => d(e) ? tt(e) : e));
	},
	entries() {
		return at(this, "entries", (e) => (e[1] = rt(this, e[1]), e));
	},
	every(e, t) {
		return ct(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return ct(this, "filter", e, t, (e) => e.map((e) => rt(this, e)), arguments);
	},
	find(e, t) {
		return ct(this, "find", e, t, (e) => rt(this, e), arguments);
	},
	findIndex(e, t) {
		return ct(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return ct(this, "findLast", e, t, (e) => rt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return ct(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return ct(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return ut(this, "includes", e);
	},
	indexOf(...e) {
		return ut(this, "indexOf", e);
	},
	join(e) {
		return tt(this).join(e);
	},
	lastIndexOf(...e) {
		return ut(this, "lastIndexOf", e);
	},
	map(e, t) {
		return ct(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return dt(this, "pop");
	},
	push(...e) {
		return dt(this, "push", e);
	},
	reduce(e, ...t) {
		return lt(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return lt(this, "reduceRight", e, t);
	},
	shift() {
		return dt(this, "shift");
	},
	some(e, t) {
		return ct(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return dt(this, "splice", e);
	},
	toReversed() {
		return tt(this).toReversed();
	},
	toSorted(e) {
		return tt(this).toSorted(e);
	},
	toSpliced(...e) {
		return tt(this).toSpliced(...e);
	},
	unshift(...e) {
		return dt(this, "unshift", e);
	},
	values() {
		return at(this, "values", (e) => rt(this, e));
	}
};
function at(e, t, n) {
	let r = nt(e), i = r[t], a = i.call(r);
	if (r !== e && !/* @__PURE__ */ Vt(e)) {
		if (a[Symbol.toStringTag] === "Array Iterator") {
			let e = Object.create(Object.getPrototypeOf(a));
			return e.next = () => ot(a.next(), n), i !== st[t] && Object.defineProperties(e, {
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
		a._next = a.next, a.next = () => ot(a._next(), n);
	}
	return a;
}
function ot(e, t) {
	return e.done || (e.value = t(e.value)), e;
}
var st = Array.prototype;
function ct(e, t, n, r, i, a) {
	let o = nt(e), s = o !== e && !/* @__PURE__ */ Vt(e), c = o[t];
	if (c !== st[t]) {
		let t = c.apply(e, a);
		return s ? Wt(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, rt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function lt(e, t, n, r) {
	let i = nt(e), a = i !== e && !/* @__PURE__ */ Vt(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = rt(e, t)), n.call(this, t, rt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? rt(e, c) : c;
}
function ut(e, t, n) {
	let r = /* @__PURE__ */ L(e);
	I(r, "iterate", $e);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Ht(n[0]) ? (n[0] = /* @__PURE__ */ L(n[0]), r[t](...n)) : i;
}
function dt(e, t, n = []) {
	Ue(), Ne();
	let r = (/* @__PURE__ */ L(e))[t].apply(e, n);
	return Pe(), We(), r;
}
var ft = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), pt = /* @__PURE__ */ new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function mt(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ L(this);
	return I(t, "has", e), t.hasOwnProperty(e);
}
var ht = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? Nt : Mt : i ? jt : At).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = it[t])) return e;
			if (t === "hasOwnProperty") return mt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ R(e) ? e : n);
		if ((_(t) ? pt.has(t) : ft(t)) || (r || I(e, "get", t), i)) return o;
		if (/* @__PURE__ */ R(o)) {
			let e = a && w(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ Lt(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ Lt(o) : /* @__PURE__ */ Ft(o) : o;
	}
}, gt = class extends ht {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && w(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ Bt(i);
			if (!/* @__PURE__ */ Vt(n) && !/* @__PURE__ */ Bt(n) && (i = /* @__PURE__ */ L(i), n = /* @__PURE__ */ L(n)), !a && /* @__PURE__ */ R(i) && !/* @__PURE__ */ R(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ R(e) ? e : r);
		return e === /* @__PURE__ */ L(r) && s && (o ? j(n, i) && et(e, "set", t, n, i) : et(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && et(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return _(t) && pt.has(t) || I(e, "has", t), n;
	}
	ownKeys(e) {
		return I(e, "iterate", d(e) ? "length" : Ze), Reflect.ownKeys(e);
	}
}, _t = class extends ht {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, vt = /* @__PURE__ */ new gt(), yt = /* @__PURE__ */ new _t(), bt = /* @__PURE__ */ new gt(!0), xt = (e) => e, St = (e) => Reflect.getPrototypeOf(e);
function Ct(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ L(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? xt : t ? Gt : Wt;
		return !t && I(a, "iterate", l ? Qe : Ze), s(Object.create(u), { next() {
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
function wt(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function Tt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ L(r), a = /* @__PURE__ */ L(n);
			e || (j(n, a) && I(i, "get", n), I(i, "get", a));
			let { has: o } = St(i), s = t ? xt : e ? Gt : Wt;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && I(/* @__PURE__ */ L(t), "iterate", Ze), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ L(n), i = /* @__PURE__ */ L(t);
			return e || (j(t, i) && I(r, "has", t), I(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ L(a), s = t ? xt : e ? Gt : Wt;
			return !e && I(o, "iterate", Ze), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: wt("add"),
		set: wt("set"),
		delete: wt("delete"),
		clear: wt("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ L(this), r = St(n), i = /* @__PURE__ */ L(e), a = !t && !/* @__PURE__ */ Vt(e) && !/* @__PURE__ */ Bt(e) ? i : e;
			return r.has.call(n, a) || j(e, a) && r.has.call(n, e) || j(i, a) && r.has.call(n, i) || (n.add(a), et(n, "add", a, a)), this;
		},
		set(e, n) {
			t || /* @__PURE__ */ Vt(n) || /* @__PURE__ */ Bt(n) || (n = /* @__PURE__ */ L(n));
			let r = /* @__PURE__ */ L(this), { has: i, get: a } = St(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ L(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? j(n, s) && et(r, "set", e, n, s) : et(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ L(this), { has: n, get: r } = St(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ L(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && et(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ L(this), t = e.size !== 0, n = e.clear();
			return t && et(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = Ct(r, e, t);
	}), n;
}
function Et(e, t) {
	let n = Tt(e, t);
	return (r, i, a) => i === "__v_isReactive" ? !e : i === "__v_isReadonly" ? e : i === "__v_isShallow" ? t : i === "__v_raw" ? r : Reflect.get(u(n, i) && i in r ? n : r, i, a);
}
var Dt = { get: /* @__PURE__ */ Et(!1, !1) }, Ot = { get: /* @__PURE__ */ Et(!1, !0) }, kt = { get: /* @__PURE__ */ Et(!0, !1) }, At = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap(), Nt = /* @__PURE__ */ new WeakMap();
function Pt(e) {
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
function Ft(e) {
	return /* @__PURE__ */ Bt(e) ? e : Rt(e, !1, vt, Dt, At);
}
// @__NO_SIDE_EFFECTS__
function It(e) {
	return Rt(e, !1, bt, Ot, jt);
}
// @__NO_SIDE_EFFECTS__
function Lt(e) {
	return Rt(e, !0, yt, kt, Mt);
}
function Rt(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = Pt(S(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
	return /* @__PURE__ */ Bt(e) ? /* @__PURE__ */ zt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Ht(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function L(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ L(t) : e;
}
function Ut(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && re(e, "__v_skip", !0), e;
}
var Wt = (e) => v(e) ? /* @__PURE__ */ Ft(e) : e, Gt = (e) => v(e) ? /* @__PURE__ */ Lt(e) : e;
// @__NO_SIDE_EFFECTS__
function R(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function z(e) {
	return qt(e, !1);
}
// @__NO_SIDE_EFFECTS__
function Kt(e) {
	return qt(e, !0);
}
function qt(e, t) {
	return /* @__PURE__ */ R(e) ? e : new Jt(e, t);
}
var Jt = class {
	constructor(e, t) {
		this.dep = new Je(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ L(e), this._value = t ? e : Wt(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Vt(e) || /* @__PURE__ */ Bt(e);
		e = n ? e : /* @__PURE__ */ L(e), j(e, t) && (this._rawValue = e, this._value = n ? e : Wt(e), this.dep.trigger());
	}
};
function Yt(e) {
	e.dep && e.dep.trigger();
}
function B(e) {
	return /* @__PURE__ */ R(e) ? e.value : e;
}
var Xt = {
	get: (e, t, n) => t === "__v_raw" ? e : B(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ R(i) && !/* @__PURE__ */ R(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Zt(e) {
	return /* @__PURE__ */ zt(e) ? e : new Proxy(e, Xt);
}
var Qt = class {
	constructor(e) {
		this.__v_isRef = !0, this._value = void 0;
		let t = this.dep = new Je(), { get: n, set: r } = e(t.track.bind(t), t.trigger.bind(t));
		this._get = n, this._set = r;
	}
	get value() {
		return this._value = this._get();
	}
	set value(e) {
		this._set(e);
	}
};
function $t(e) {
	return new Qt(e);
}
var en = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Je(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ke - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && F !== this) return Me(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return Re(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function tn(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new en(r, i, n);
}
var nn = {}, rn = /* @__PURE__ */ new WeakMap(), an = void 0;
function on(e, t = !1, n = an) {
	if (n) {
		let t = rn.get(n);
		t || rn.set(n, t = []), t.push(e);
	}
}
function sn(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Vt(e) || o === !1 || o === 0 ? cn(e, 1) : cn(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ R(e) ? (g = () => e.value, y = /* @__PURE__ */ Vt(e)) : /* @__PURE__ */ zt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ zt(e) || /* @__PURE__ */ Vt(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ R(e)) return e.value;
		if (/* @__PURE__ */ zt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			Ue();
			try {
				_();
			} finally {
				We();
			}
		}
		let t = an;
		an = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			an = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => cn(e(), t);
	}
	let x = Ee(), S = () => {
		m.stop(), x && x.active && c(x.effects, m);
	};
	if (s && n) {
		let e = n;
		n = (...t) => {
			try {
				return e(...t);
			} finally {
				S();
			}
		};
	}
	let C = b ? Array(e.length).fill(nn) : nn, w = (e) => {
		if (m.flags & 1 && (m.dirty || e)) {
			if (n) {
				let t = m.run();
				if (e || o || y || (b ? t.some((e, t) => j(e, C[t])) : j(t, C))) {
					let e = an;
					Ue();
					try {
						_ && _(), an = m;
						let e = [
							t,
							C === nn ? void 0 : b && C[0] === nn ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						an = e, We();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new Oe(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => on(e, !1, m), _ = m.onStop = () => {
		let e = rn.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			rn.delete(m);
		}
	}, n ? a ? w(!0) : C = m.run() : l ? l(w.bind(null, !0), !0) : m.run(), S.pause = m.pause.bind(m), S.resume = m.resume.bind(m), S.stop = S, S;
}
function cn(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ R(e)) cn(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) cn(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		cn(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) cn(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && cn(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function ln(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		dn(e, t, n);
	}
}
function un(e, t, n, r) {
	if (h(e)) {
		let i = ln(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			dn(e, t, n, void 0, !0);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(un(e[a], t, n, r));
		return i;
	}
}
function dn(e, n, r, i = !0, a = !1) {
	let o = n ? n.vnode : null, { errorHandler: s, throwUnhandledErrorInProduction: c } = n && n.appContext.config || t;
	if (n) {
		let t = n.parent, i = n.proxy, o = `https://vuejs.org/error-reference/#runtime-${r}`;
		for (; t;) {
			let n = t.ec;
			if (n && !t.isUnmounted && (!a || t.scope.active)) {
				for (let t = 0; t < n.length; t++) if (n[t](e, i, o) === !1) return;
			}
			t = t.parent;
		}
		if (s) {
			Ue(), ln(s, null, 10, [
				e,
				i,
				o
			]), We();
			return;
		}
	}
	fn(e, r, o, i, c);
}
function fn(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var pn = [], mn = -1, hn = [], gn = null, _n = 0, vn = /* @__PURE__ */ Promise.resolve(), yn = null;
function bn(e) {
	let t = yn || vn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function xn(e) {
	let t = mn + 1, n = pn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = pn[r], a = kn(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function Sn(e) {
	if (!(e.flags & 1)) {
		let t = kn(e), n = pn[pn.length - 1];
		!n || !(e.flags & 2) && t >= kn(n) ? pn.push(e) : pn.splice(xn(t), 0, e), e.flags |= 1, Cn();
	}
}
function Cn() {
	yn ||= vn.then(An);
}
function wn(e) {
	if (!d(e)) gn && e.id === -1 ? gn.splice(_n + 1, 0, e) : e.flags & 1 || (hn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) hn.push(e[t]);
	Cn();
}
function Tn(e, t, n, r = mn + 1) {
	for (; r < pn.length; r++) {
		let n = pn[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			pn.splice(r, 1), r = e ? r - 1 : mn, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function En(e, t, n = 0) {
	if (hn.length) {
		let e = hn, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < hn.length; i++) {
				let a = hn[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? hn[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => kn(e) - kn(t));
		if (hn.length = r, gn) {
			for (let e = 0; e < i.length; e++) gn.push(i[e]);
			return;
		}
		for (gn = i, _n = 0; _n < gn.length; _n++) {
			let e = gn[_n];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		gn = null, _n = 0;
	}
}
var Dn = !1;
function On(e, t) {
	if (Dn) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(hn);
	e(), Dn = !0;
	try {
		Tn(void 0, t), En(void 0, n, t);
	} finally {
		Dn = !1;
	}
}
var kn = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function An(e) {
	try {
		for (mn = 0; mn < pn.length; mn++) {
			let e = pn[mn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), ln(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; mn < pn.length; mn++) {
			let e = pn[mn];
			e && (e.flags &= -2);
		}
		mn = -1, pn.length = 0, En(e), yn = null, (pn.length || hn.length) && An(e);
	}
}
var jn = null, Mn = null;
function Nn(e) {
	let t = jn;
	return jn = e, Mn = e && e.type.__scopeId || null, t;
}
function Pn(e, t = jn, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Qi(-1);
		let i = Nn(t), a = Ji.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Ji.length; e > a; e--) Xi();
			Nn(i), r._d && Qi(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function V(e, n) {
	if (jn === null) return e;
	let r = ja(jn), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && cn(o), i.push({
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
function Fn(e, t, n, r) {
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
		u && (Ue(), un(u, n, 8, [
			e.el,
			l,
			i,
			t
		]), We());
	}
}
function In(e, t) {
	if (Y) {
		let n = Y.provides, r = Y.parent && Y.parent.provides;
		r === n && (n = Y.provides = Object.create(r)), n[e] = t;
	}
}
function Ln(e, t, n = !1) {
	let r = _a();
	if (r || Qr) {
		let i = Qr ? Qr._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var Rn = /* @__PURE__ */ Symbol.for("v-scx"), zn = () => Ln(Rn);
function Bn(e, t) {
	return Hn(e, null, { flush: "sync" });
}
function Vn(e, t, n) {
	return Hn(e, t, n);
}
function Hn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (Ca) {
		if (c === "sync") {
			let e = zn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = Y;
	u.call = (e, t, n) => un(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, ji(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : Sn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = sn(e, n, u);
	return Ca && (f ? f.push(h) : d && h()), h;
}
function Un(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Wn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = ba(this), s = Hn(i, a.bind(r), n);
	return o(), s;
}
function Wn(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Gn = /* @__PURE__ */ Symbol("_vte"), Kn = (e) => e.__isTeleport, qn = /* @__PURE__ */ Symbol("_leaveCb");
function Jn(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Ki) {
			t = n;
			break;
		}
	}
	return t;
}
function Yn(e) {
	if (!ar(e)) return Kn(e.type) && e.children ? Jn(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function Xn(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		Xn(Kn(n.type) && Yn(n) || n, t);
	} else if (e.shapeFlag & 128) {
		let n = e.suspense;
		if (n) {
			let e = n.isHydrating ? n.pendingBranch : n.activeBranch;
			e && Xn(e, t.clone(e));
		} else e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	} else if (e.transition = t, e.type === H && d(e.children)) {
		let n = oi(e.children, !1);
		n && Xn(n, t);
	}
}
function Zn(e) {
	if (e.component) return Zn(e.component.subTree);
	if (e.type === H) {
		let t = d(e.children) && oi(e.children, !1);
		return t ? Zn(t) : void 0;
	}
	if (e.type !== Ki) return e;
}
// @__NO_SIDE_EFFECTS__
function Qn(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function $n(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function er(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var tr = /* @__PURE__ */ new WeakMap();
function nr(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => nr(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (ir(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && nr(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? ja(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ L(v), b = v === t ? i : (e) => !er(_, e) && u(y, e), x = (e, t) => !(t && er(_, t));
	if (m != null && m !== p) {
		if (rr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ R(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) ln(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ R(p);
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
				} else t ? (_[p] = l, b(p) && (v[p] = l)) : n && (x(p, e.k) && (p.value = l), e.k && (_[e.k] = l));
			};
			if (l) {
				let t = () => {
					i(), tr.delete(e);
				};
				t.id = -1, tr.set(e, t), ji(t, r);
			} else rr(e), i();
		}
	}
}
function rr(e) {
	let t = tr.get(e);
	t && (t.flags |= 8, tr.delete(e));
}
oe().requestIdleCallback, oe().cancelIdleCallback;
var ir = (e) => !!e.type.__asyncLoader, ar = (e) => e.type.__isKeepAlive;
function or(e, t) {
	cr(e, "a", t);
}
function sr(e, t) {
	cr(e, "da", t);
}
function cr(e, t, n = Y) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (ur(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) ar(e.parent.vnode) && lr(r, t, n, e), e = e.parent;
	}
}
function lr(e, t, n, r) {
	let i = ur(t, e, r, !0), a = ur("um", () => c(r[t], i), n);
	a.flags = 16;
}
function ur(e, t, n = Y, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Ue();
			let i = ba(n), a = un(t, n, e, r);
			return i(), We(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var dr = (e) => (t, n = Y) => {
	Ca && e !== "sp" || ur(e, (...e) => t(...e), n);
}, fr = dr("bm"), pr = dr("m"), mr = dr("bu"), hr = dr("u"), gr = dr("bum"), _r = dr("um"), vr = dr("sp"), yr = dr("rtg"), br = dr("rtc");
function xr(e, t = Y) {
	ur("ec", e, t);
}
var Sr = "components", Cr = /* @__PURE__ */ Symbol.for("v-ndc");
function wr(e) {
	return g(e) ? Tr(Sr, e, !1) || e : e || Cr;
}
function Tr(e, t, n = !0, r = !1) {
	let i = jn || Y;
	if (i) {
		let n = i.type;
		if (e === Sr) {
			let e = Ma(n, !1);
			if (e && (e === t || e === D(t) || e === k(D(t)))) return n;
		}
		let a = Er(i[e] || n[e], t) || Er(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Er(e, t) {
	return e && (e[t] || e[D(t)] || e[k(D(t))]);
}
function Dr(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ zt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Vt(e), s = /* @__PURE__ */ Bt(e), e = nt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Gt(Wt(e[n])) : Wt(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		if (!Number.isInteger(e) || e < 0) i = [];
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
var Or = (e) => e ? Sa(e) ? ja(e) : Or(e.parent) : null, kr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => Or(e.parent),
	$root: (e) => Or(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => zr(e),
	$forceUpdate: (e) => e.f ||= () => {
		Sn(e.update);
	},
	$nextTick: (e) => e.n ||= bn.bind(e.proxy),
	$watch: (e) => Un.bind(e)
}), Ar = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), jr = {
	get({ _: e }, n) {
		if (n === "__v_skip") return !0;
		let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
		if (n[0] !== "$") {
			let e = s[n];
			if (e !== void 0) switch (e) {
				case 1: return i[n];
				case 2: return a[n];
				case 4: return r[n];
				case 3: return o[n];
			}
			else if (Ar(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Pr && (s[n] = 0);
		}
		let d = kr[n], f, p;
		if (d) return n === "$attrs" && I(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Ar(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Ar(n, c) || u(o, c) || u(i, c) || u(kr, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function Mr(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
function Nr(e, t) {
	return !e || !t ? e || t : d(e) && d(t) ? e.concat(t) : s({}, Mr(e), Mr(t));
}
var Pr = !0;
function Fr(e) {
	let t = zr(e), n = e.proxy, i = e.ctx;
	Pr = !1, t.beforeCreate && Lr(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: T, renderTracked: ee, renderTriggered: te, errorCaptured: E, serverPrefetch: D, expose: ne, inheritAttrs: O, components: k, directives: A, filters: j } = t;
	if (u && Ir(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Ft(t));
	}
	if (Pr = !0, o) for (let e in o) {
		let t = o[e], a = X({
			get: h(t) ? t.bind(n, n) : h(t.get) ? t.get.bind(n, n) : r,
			set: !h(t) && h(t.set) ? t.set.bind(n) : r
		});
		Object.defineProperty(i, e, {
			enumerable: !0,
			configurable: !0,
			get: () => a.value,
			set: (e) => a.value = e
		});
	}
	if (c) for (let e in c) Rr(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			In(t, e[t]);
		});
	}
	f && Lr(f, e, "c");
	function M(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (M(fr, p), M(pr, m), M(mr, g), M(hr, _), M(or, y), M(sr, b), M(xr, E), M(br, ee), M(yr, te), M(gr, S), M(_r, w), M(vr, D), d(ne)) {
		if (ne.length) {
			let t = e.exposed ||= {};
			ne.forEach((e) => {
				Object.defineProperty(t, e, {
					get: () => n[e],
					set: (t) => n[e] = t,
					enumerable: !0
				});
			});
		} else e.exposed ||= {};
	}
	T && e.render === r && (e.render = T), O != null && (e.inheritAttrs = O), k && (e.components = k), A && (e.directives = A), D && $n(e);
}
function Ir(e, t, n = r) {
	d(e) && (e = Wr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Ln(r.from || n, r.default, !0) : Ln(r.from || n) : Ln(r), /* @__PURE__ */ R(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Lr(e, t, n) {
	un(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Rr(e, t, n, r) {
	let i = r.includes(".") ? Wn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && Vn(i, n);
	} else if (h(e)) Vn(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Rr(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && Vn(i, r, e);
		}
	}
}
function zr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Br(c, e, o, !0)), Br(c, t, o)), v(t) && a.set(t, c), c;
}
function Br(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Br(e, a, n, !0), i && i.forEach((t) => Br(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Vr[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Vr = {
	data: Hr,
	props: qr,
	emits: qr,
	methods: Kr,
	computed: Kr,
	beforeCreate: Gr,
	created: Gr,
	beforeMount: Gr,
	mounted: Gr,
	beforeUpdate: Gr,
	updated: Gr,
	beforeDestroy: Gr,
	beforeUnmount: Gr,
	destroyed: Gr,
	unmounted: Gr,
	activated: Gr,
	deactivated: Gr,
	errorCaptured: Gr,
	serverPrefetch: Gr,
	components: Kr,
	directives: Kr,
	watch: Jr,
	provide: Hr,
	inject: Ur
};
function Hr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Ur(e, t) {
	return Kr(Wr(e), Wr(t));
}
function Wr(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function Gr(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Kr(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function qr(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), Mr(e), Mr(t ?? {})) : t;
}
function Jr(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = Gr(e[r], t[r]);
	return n;
}
function Yr() {
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
var Xr = 0;
function Zr(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = Yr(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: Xr++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: Pa,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && h(e.install) ? (a.add(e), e.install(l, ...t)) : h(e) && (a.add(e), e(l, ...t))), l;
			},
			mixin(e) {
				return i.mixins.includes(e) || i.mixins.push(e), l;
			},
			component(e, t) {
				return t ? (i.components[e] = t, l) : i.components[e];
			},
			directive(e, t) {
				return t ? (i.directives[e] = t, l) : i.directives[e];
			},
			mount(a, o, s) {
				if (!c) {
					let u = l._ceVNode || K(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, ja(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (un(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = Qr;
				Qr = l;
				try {
					return e();
				} finally {
					Qr = t;
				}
			}
		};
		return l;
	};
}
var Qr = null;
function $r(e, n, r = t) {
	let i = _a(), a = D(n), o = O(n), s = ei(e, a), c = $t((s, c) => {
		let l, u = t, d;
		return Bn(() => {
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
var ei = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${D(t)}Modifiers`] || e[`${O(t)}Modifiers`];
function ti(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ei(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(ie)));
	let c, l = i[c = A(n)] || i[c = A(D(n))];
	!l && o && (l = i[c = A(O(n))]), l && un(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, un(u, e, 6, a);
	}
}
var ni = /* @__PURE__ */ new WeakMap();
function ri(e, t, n = !1) {
	let r = n ? ni : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = ri(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function ii(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, O(t)) || u(e, t));
}
function ai(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Nn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = ca(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = ca(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : si(c);
		}
	} catch (t) {
		Ji.length = 0, dn(t, e, 1), v = K(Ki);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = ci(y, a)), b = sa(b, y, !1, !0));
	}
	return n.dirs && (b = sa(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && Xn(Kn(b.type) && Yn(b) || b, n.transition), v = b, Nn(_), v;
}
function oi(e, t = !0) {
	let n;
	for (let t = 0; t < e.length; t++) {
		let r = e[t];
		if (ta(r)) {
			if (r.type !== Ki || r.children === "v-if") {
				if (n) return;
				n = r;
			}
		} else return;
	}
	return n;
}
var si = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, ci = (e, t) => {
	let n = {};
	for (let r in e) o(r) && r.slice(9) in t || (n[r] = e[r]);
	return n;
};
function li(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? ui(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (di(o, r, n) && !ii(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || ui(r, o, l) : !!o;
	return !1;
}
function ui(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (!u(e, a) || di(t, e, a) && !ii(n, a)) return !0;
	}
	return !1;
}
function di(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !ye(r, i) : r !== i;
}
function fi({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var pi = {}, mi = () => Object.create(pi), hi = (e) => Object.getPrototypeOf(e) === pi;
function gi(e, t, n, r = !1) {
	let i = {}, a = mi();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), vi(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	e.props = n ? r ? i : /* @__PURE__ */ It(i) : e.type.props ? i : a, e.attrs = a;
}
function _i(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ L(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (ii(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) {
					if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
					else {
						let t = D(o);
						i[t] = yi(c, s, t, d, e, !1);
					}
				} else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		vi(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) t && (u(t, a) || (r = O(a)) !== a && u(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = yi(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && u(t, e) || (delete a[e], l = !0);
	}
	l && et(e.attrs, "set", "");
}
function vi(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (T(t)) continue;
		let l = n[t], d;
		a && u(a, d = D(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : ii(e.emitsOptions, t) || t in i && l === i[t] || (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ L(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = yi(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function yi(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = ba(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === O(n)) && (r = !0));
	}
	return r;
}
var bi = /* @__PURE__ */ new WeakMap();
function xi(e, r, i = !1) {
	let a = i ? bi : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = xi(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = D(c[e]);
		Si(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = D(e);
		if (Si(t)) {
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
	let m = [l, f];
	return v(e) && a.set(e, m), m;
}
function Si(e) {
	return e[0] !== "$" && !T(e);
}
var Ci = (e) => e === "_" || e === "_ctx" || e === "$stable", wi = (e) => d(e) ? e.map(ca) : [ca(e)], Ti = (e, t, n) => {
	if (t._n) return t;
	let r = Pn((...e) => wi(t(...e)), n);
	return r._c = !1, r;
}, Ei = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ci(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Ti(n, i, r);
		else if (i != null) {
			let e = wi(i);
			t[n] = () => e;
		}
	}
}, Di = (e, t) => {
	let n = wi(t);
	e.slots.default = () => n;
}, Oi = (e, t, n) => {
	for (let r in t) (n || !Ci(r)) && (e[r] = t[r]);
}, ki = (e, t, n) => {
	let r = e.slots = mi();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Oi(r, t, n), n && re(r, "_", e, !0)) : Ei(t, r);
	} else t && Di(e, t);
}, Ai = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Oi(a, n, r) : (o = !n.$stable, Ei(n, a)), s = n;
	} else n && (Di(e, n), s = { default: 1 });
	if (o) for (let e in a) !Ci(e) && s[e] == null && delete a[e];
}, ji = Wi;
function Mi(e) {
	return Ni(e);
}
function Ni(e, i) {
	let a = oe();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, r, i = null, a = null, o = null, s = void 0, c = null, l = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !na(e, t) && (i = ge(e), de(e, a, o, !0), e = null), t.patchFlag === -2 && (l = !1, t.dynamicChildren = null), t.dynamicChildren && e && e.dynamicChildren && e.dynamicChildren.hasOnce && (t.dynamicChildren === n && (t.dynamicChildren = []), t.dynamicChildren.hasOnce = !0);
		let { type: u, ref: d, shapeFlag: f } = t;
		switch (u) {
			case Gi:
				y(e, t, r, i);
				break;
			case Ki:
				b(e, t, r, i);
				break;
			case qi:
				e ?? x(t, r, i, s);
				break;
			case H:
				k(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? A(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, ve);
		}
		d != null && a ? nr(d, e && e.ref, o, t || e, !t) : d == null && e && e.ref != null && nr(e.ref, null, o, e, !0);
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
	}, S = ({ el: e, anchor: t }, n, r) => {
		let i;
		for (; e && e !== t;) i = h(e), o(e, n, r), e = i;
		o(t, n, r);
	}, C = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, w = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) ee(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), D(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, ee = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && E(e.children, d, null, r, i, Pi(e, a), s, u), _ && Fn(e, null, r, "created"), te(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !T(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && fa(f, r, e);
		}
		_ && Fn(e, null, r, "beforeMount");
		let v = Ii(i, g);
		v ? g.beforeEnter(d) : g && !g.persisted && (d[Ui] = !0), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && ji(() => {
			try {
				f && fa(f, r, e), v && g.enter(d), _ && Fn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, te = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Hi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				te(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, E = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? la(e[l]) : ca(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, D = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Fi(r, !1), (g = h.onVnodeBeforeUpdate) && fa(g, r, n, e), f && Fn(n, e, r, "beforeUpdate"), r && Fi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? ne(e.dynamicChildren, d, l, r, i, Pi(n, a), o) : s || se(e, n, l, null, r, i, Pi(n, a), o, !1), u > 0) {
			if (u & 16) O(l, m, h, r, a);
			else if (u & 2 && m.class !== h.class && c(l, "class", null, h.class, a), u & 4 && c(l, "style", m.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = m[n], o = h[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && p(l, n.children);
		} else !s && d == null && O(l, m, h, r, a);
		((g = h.onVnodeUpdated) || f) && ji(() => {
			g && fa(g, r, n, e), f && Fn(n, e, r, "updated");
		}, i);
	}, ne = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Vi(c), d = u && (c.type === H || !na(c, l) || c.shapeFlag & 198) ? m(u) : n;
			v(c, l, d, null, r, i, a, o, !0);
		}
	}, O = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !T(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (T(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, k = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), E(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (ne(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Li(e, t, !0)) : se(e, t, n, f, i, a, s, c, l);
	}, A = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : j(t, n, r, i, a, o, c) : re(e, t, c);
	}, j = (e, t, n, r, i, a, o) => {
		let s = e.component = ga(e, r, i);
		if (ar(e) && (s.ctx.renderer = ve), wa(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, ie, o, a), !e.el) {
				let r = s.subTree = K(Ki);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else ie(s, e, t, n, i, a, o);
	}, re = (e, t, n) => {
		let r = t.component = e.component;
		if (li(e, t, n)) {
			if (r.asyncDep && !r.asyncResolved) {
				t.el = e.el, t.placeholder = e.placeholder, ae(r, t, n);
				return;
			}
			r.next = t, r.update();
		} else t.el = e.el, t.placeholder = e.placeholder, r.vnode = t;
	}, ie = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = zi(e);
					if (n) {
						t && (t.el = c.el, ae(e, t, o)), n.asyncDep.then(() => {
							let t = () => {
								e.job.flags & 8 || (i && i.pendingBranch ? ji(t, i) : l());
							};
							t.flags = 48, ji(t, i);
						});
						return;
					}
				}
				let u = t, d;
				Fi(e, !1), t ? (t.el = c.el, ae(e, t, o)) : t = c, n && M(n), (d = t.props && t.props.onVnodeBeforeUpdate) && fa(d, s, t, c), Fi(e, !0);
				let f = ai(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el || Vi(p)), ge(p), e, i, a), t.el = f.el, u === null && fi(e, f.el), r && ji(r, i), (d = t.props && t.props.onVnodeUpdated) && ji(() => fa(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = ir(t);
				if (Fi(e, !1), l && M(l), !m && (o = c && c.onVnodeBeforeMount) && fa(o, d, t), Fi(e, !0), s && be) {
					let t = () => {
						e.subTree = ai(e), be(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = ai(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && ji(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					ji(() => fa(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && ir(d.vnode) && d.vnode.shapeFlag & 256) && e.a && ji(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Oe(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => Sn(u), Fi(e, !0), l();
	}, ae = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, _i(e, t.props, r, n), Ai(e, t.children, n), Ue(), Tn(e), We();
	}, se = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				le(l, d, n, r, i, a, o, s, c);
				return;
			}
			if (f & 256) {
				ce(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && he(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? le(l, d, n, r, i, a, o, s, c) : he(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && E(d, n, r, i, a, o, s, c));
	}, ce = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p = 0;
		for (; p < f; p++) {
			let n = t[p] = l ? la(t[p]) : ca(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? he(e, a, o, !0, !1, f) : E(t, r, i, a, o, s, c, l, f);
	}, le = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? la(t[u]) : ca(t[u]);
			if (na(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? la(t[p]) : ca(t[p]);
			if (na(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? la(t[u]) : ca(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) de(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? la(t[u]) : ca(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, S = 0, C = Array(b);
			for (u = 0; u < b; u++) C[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					de(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (C[_ - h] === 0 && na(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? de(n, a, o, !0) : (C[i - h] = u + 1, i >= S ? S = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let w = x ? Ri(C) : n;
			for (_ = w.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Vi(f) : i;
				C[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== w[_] ? ue(n, r, p, 2) : _--);
			}
		}
	}, ue = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) ue(e.component.subTree, t, n, r);
		else if (d & 128) e.suspense.move(t, n, r);
		else if (d & 64) c.move(e, t, n, ve);
		else if (c === H) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) ue(u[e], t, n, r);
			o(e.anchor, t, n);
		} else if (c === qi) S(e, t, n);
		else if (r !== 2 && d & 1 && l) {
			if (r === 0) l.persisted && !a[qn] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), ji(() => l.enter(a), i));
			else {
				let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? s(a) : o(a, t, n);
				}, d = () => {
					let e = a._isLeaving || !!a[qn];
					a._isLeaving && a[qn](!0), l.persisted && !e ? u() : r(a, () => {
						u(), c && c();
					});
				};
				i ? i(a, u, d) : d();
			}
		} else o(a, t, n);
	}, de = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (Ue(), nr(s, null, n, e, !0), We()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256 && t.ctx.deactivate(e)) return;
		let h = u & 1 && f, g = !ir(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && fa(_, t, e), u & 6) me(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Fn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ve, r) : l && !l.hasOnce && (a !== H || d > 0 && d & 64) ? he(l, t, n, !1, !0) : (a === H && d & 384 || !i && u & 16) && he(c, t, n), r && fe(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && ji(() => {
			_ && fa(_, t, e), h && Fn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, fe = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e, a = t === H;
		if (a && !i) {
			pe(n, r);
			return;
		}
		if (t === qi) {
			C(e), i && !i.persisted && i.afterLeave && i.afterLeave();
			return;
		}
		let o = a ? Zn(e) : e, c = () => {
			a ? m(n) && pe(n, r) : s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (o && o.shapeFlag & 1 && i && !i.persisted) {
			let { leave: e, delayLeave: t } = i, n = o.el, r = () => e(n, c);
			t ? t(n, c, r) : r();
		} else c();
	}, pe = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, me = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Bi(c), Bi(l), r && M(r), i.stop(), a ? (a.flags |= 8, de(o, e, t, n)) : o && (o.transition = e.vnode.transition, de(o, e, t, n)), s && ji(s, t);
		let u = () => {
			e.isUnmounted = !0;
		};
		u.flags = 16, ji(u, t);
	}, he = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) de(e[o], t, n, r, i);
	}, ge = (e) => {
		if (e.shapeFlag & 6) return ge(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Gn];
		return n ? h(n) : t;
	}, _e = (e, t, n) => {
		On(() => {
			e == null ? t._vnode && de(t._vnode, null, null, !0) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e;
		}, e && t._vnode ? void 0 : e && e.component ? e.component.uid : ha());
	}, ve = {
		p: v,
		um: de,
		m: ue,
		r: fe,
		mt: j,
		mc: E,
		pc: se,
		pbc: ne,
		n: ge,
		o: e
	}, ye, be;
	return i && ([ye, be] = i(ve)), {
		render: _e,
		hydrate: ye,
		createApp: Zr(_e, ye)
	};
}
function Pi({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Fi({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Ii(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Li(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = la(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Li(t, a)), a.type === Gi && (a.patchFlag === -1 && (a = i[e] = la(a)), a.el = t.el), a.type === Ki && !a.el && (a.el = t.el);
	}
}
function Ri(e) {
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
function zi(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : zi(t);
}
function Bi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Vi(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	if (t) return Vi(t.subTree);
	let n = e.suspense;
	return n && n.activeBranch ? Vi(n.activeBranch) : null;
}
var Hi = (e) => e.__isSuspense, Ui = /* @__PURE__ */ Symbol("_deferredEnter");
function Wi(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : wn(e);
}
var H = /* @__PURE__ */ Symbol.for("v-fgt"), Gi = /* @__PURE__ */ Symbol.for("v-txt"), Ki = /* @__PURE__ */ Symbol.for("v-cmt"), qi = /* @__PURE__ */ Symbol.for("v-stc"), Ji = [], Yi = null;
function U(e = !1) {
	Ji.push(Yi = e ? null : []);
}
function Xi() {
	Ji.pop(), Yi = Ji[Ji.length - 1] || null;
}
var Zi = 1;
function Qi(e, t = !1) {
	Zi += e, e < 0 && Yi && t && (Yi.hasOnce = !0);
}
function $i(e) {
	return e.dynamicChildren = Zi > 0 ? Yi || n : null, Xi(), Zi > 0 && Yi && Yi.push(e), e;
}
function W(e, t, n, r, i, a) {
	return $i(G(e, t, n, r, i, a, !0));
}
function ea(e, t, n, r, i) {
	return $i(K(e, t, n, r, i, !0));
}
function ta(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function na(e, t) {
	return e.type === t.type && e.key === t.key;
}
var ra = ({ key: e }) => e ?? null, ia = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ R(e) || h(e) ? {
	i: jn,
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
		key: t && ra(t),
		ref: t && ia(t),
		scopeId: Mn,
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
		ctx: jn
	};
	return s ? (ua(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), Zi > 0 && !o && Yi && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Yi.push(c), c;
}
var K = aa;
function aa(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== Cr || (e = Ki), ta(e)) {
		let r = sa(e, t, !0);
		return n && ua(r, n), Zi > 0 && !a && Yi && (r.shapeFlag & 6 ? Yi[Yi.indexOf(e)] = r : Yi.push(r)), r.patchFlag = -2, r;
	}
	if (Na(e) && (e = e.__vccOpts), t) {
		t = oa(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = fe(e)), v(n) && (/* @__PURE__ */ Ht(n) && !d(n) && (n = s({}, n)), t.style = se(n));
	}
	let o = g(e) ? 1 : Hi(e) ? 128 : Kn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return G(e, t, n, r, i, o, a, !0);
}
function oa(e) {
	return e ? /* @__PURE__ */ Ht(e) ? s({}, e) : hi(e) ? s({}, e[Oa] || e) : e : null;
}
function sa(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? da(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && ra(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(ia(t)) : [a, ia(t)] : ia(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
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
		ssContent: e.ssContent && sa(e.ssContent),
		ssFallback: e.ssFallback && sa(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce,
		cacheIndex: e.cacheIndex
	};
	return c && r && Xn(u, c.clone(u)), u;
}
function q(e = " ", t = 0) {
	return K(Gi, null, e, t);
}
function J(e = "", t = !1) {
	return t ? (U(), ea(Ki, null, e)) : K(Ki, null, e);
}
function ca(e) {
	return e == null || typeof e == "boolean" ? K(Ki) : d(e) ? K(H, null, e.slice()) : ta(e) ? la(e) : K(Gi, null, String(e));
}
function la(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : sa(e);
}
function ua(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") {
		if (r & 65) {
			let n = t.default;
			n && (n._c && (n._d = !1), ua(e, n()), n._c && (n._d = !0));
			return;
		}
		{
			n = 32;
			let r = t._;
			!r && !hi(t) ? t._ctx = jn : r === 3 && jn && (jn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			ua(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: jn
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [q(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function da(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = fe([t.class, r.class]));
		else if (e === "style") t.style = se([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function fa(e, t, n, r = null) {
	un(e, t, 7, [n, r]);
}
var pa = /* @__PURE__ */ Yr(), ma = 0;
function ha() {
	return ma;
}
function ga(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || pa, o = {
		uid: ma++,
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
		scope: new Te(!0),
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
		propsOptions: xi(i, a),
		emitsOptions: ri(i, a),
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
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = ti.bind(null, o), e.ce && e.ce(o), o;
}
var Y = null, _a = () => Y || jn, va, ya;
{
	let e = oe(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	va = t("__VUE_INSTANCE_SETTERS__", (e) => Y = e), ya = t("__VUE_SSR_SETTERS__", (e) => Ca = e);
}
var ba = (e) => {
	let t = Y;
	return va(e), e.scope.on(), () => {
		e.scope.off(), va(t);
	};
}, xa = () => {
	Y && Y.scope.off(), va(null);
};
function Sa(e) {
	return e.vnode.shapeFlag & 4;
}
var Ca = !1;
function wa(e, t = !1, n = !1) {
	t && ya(t);
	let { props: r, children: i } = e.vnode, a = Sa(e);
	gi(e, r, a, t), ki(e, i, n || t);
	let o = a ? Ta(e, t) : void 0;
	return t && ya(!1), o;
}
function Ta(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, jr);
	let { setup: r } = n;
	if (r) {
		Ue();
		let n = e.setupContext = r.length > 1 ? Aa(e) : null, i = ba(e), a = ln(r, e, 0, [e.props, n]), o = y(a);
		if (We(), i(), (o || e.sp) && !ir(e) && $n(e), o) {
			if (a.then(xa, xa), t) return a.then((n) => {
				ya(!0);
				try {
					Ea(e, n, t);
				} finally {
					ya(!1);
				}
			}).catch((t) => {
				dn(t, e, 0, void 0, !0), e.ssrRender = (e, t) => t("<!---->");
			});
			e.asyncDep = a;
		} else Ea(e, a, t);
	} else Da(e, t);
}
function Ea(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Zt(t)), Da(e, n);
}
function Da(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = ba(e);
		Ue();
		try {
			Fr(e);
		} finally {
			We(), t();
		}
	}
}
var Oa = /* @__PURE__ */ Symbol(), ka = { get(e, t) {
	return I(e, "get", ""), t === Oa ? e : e[t];
} };
function Aa(e) {
	return {
		attrs: new Proxy(e.attrs, ka),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function ja(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Zt(Ut(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in kr) return kr[n](e);
		},
		has(e, t) {
			return t in e || t in kr;
		}
	}) : e.proxy;
}
function Ma(e, t = !0) {
	return h(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Na(e) {
	return h(e) && "__vccOpts" in e;
}
var X = (e, t) => /* @__PURE__ */ tn(e, t, Ca), Pa = "3.5.46", Fa = void 0, Ia = typeof window < "u" && window.trustedTypes;
if (Ia) try {
	Fa = /* @__PURE__ */ Ia.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var La = Fa ? (e) => Fa.createHTML(e) : (e) => e, Ra = "http://www.w3.org/2000/svg", za = "http://www.w3.org/1998/Math/MathML", Ba = typeof document < "u" ? document : null, Va = Ba && /* @__PURE__ */ Ba.createElement("template"), Ha = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Ba.createElementNS(Ra, e) : t === "mathml" ? Ba.createElementNS(za, e) : n ? Ba.createElement(e, { is: n }) : Ba.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Ba.createTextNode(e),
	createComment: (e) => Ba.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Ba.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Va.innerHTML = La(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Va.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Ua = /* @__PURE__ */ Symbol("_vtc");
function Wa(e, t, n) {
	let r = e[Ua];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Ga = /* @__PURE__ */ Symbol("_vod"), Ka = /* @__PURE__ */ Symbol("_vsh"), qa = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[Ga] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Ja(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), Ja(e, !0), r.enter(e)) : r.leave(e, () => {
			Ja(e, !1);
		}) : Ja(e, t));
	},
	beforeUnmount(e, { value: t }) {
		Ja(e, t);
	}
};
function Ja(e, t) {
	e.style.display = t ? e[Ga] : "none", e[Ka] = !t;
}
var Ya = /* @__PURE__ */ Symbol(""), Xa = /(?:^|;)\s*display\s*:/;
function Za(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? $a(r, t, "");
			}
			else for (let e in t) n[e] ?? $a(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? $a(r, i, "") : ro(e, i, !g(t) && t ? t[i] : void 0, o) || $a(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[Ya];
			e && (n += ";" + e), r.cssText = n, a = Xa.test(n);
		}
	} else t && e.removeAttribute("style");
	Ga in e && (i && t === n || (e[Ga] = a ? r.display : ""), e[Ka] && (r.display = "none"));
}
var Qa = /\s*!important$/;
function $a(e, t, n) {
	if (d(n)) n.forEach((n) => $a(e, t, n));
	else if (n ??= "", t.startsWith("--")) Qa.test(n) ? e.setProperty(t, n.replace(Qa, ""), "important") : e.setProperty(t, n);
	else {
		let r = no(e, t);
		Qa.test(n) ? e.setProperty(O(r), n.replace(Qa, ""), "important") : e[r] = n;
	}
}
var eo = [
	"Webkit",
	"Moz",
	"ms"
], to = {};
function no(e, t) {
	let n = to[t];
	if (n) return n;
	let r = D(t);
	if (r !== "filter" && r in e) return to[t] = r;
	r = k(r);
	for (let n = 0; n < eo.length; n++) {
		let i = eo[n] + r;
		if (i in e) return to[t] = i;
	}
	return t;
}
function ro(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var io = "http://www.w3.org/1999/xlink";
function ao(e, t, n, r, i, a = pe(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(io, t.slice(6, t.length)) : e.setAttributeNS(io, t, n) : n == null || a && !me(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function oo(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? La(n) : n);
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
		r === "boolean" ? n = me(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function so(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function co(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var lo = /* @__PURE__ */ Symbol("_vei");
function uo(e, t, n, r, i = null) {
	let a = e[lo] || (e[lo] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = mo(t);
		r ? so(e, n, a[t] = vo(r, i), s) : o && (co(e, n, o, s), a[t] = void 0);
	}
}
var fo = /(Once|Passive|Capture)$/, po = /^on:?(?:Once|Passive|Capture)$/;
function mo(e) {
	let t, n;
	for (; (n = e.match(fo)) && !po.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : O(e.slice(2)), t];
}
var ho = 0, go = /* @__PURE__ */ Promise.resolve(), _o = () => ho ||= (go.then(() => ho = 0), Date.now());
function vo(e, t) {
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
				e && un(e, t, 5, a);
			}
		} else un(r, t, 5, [e]);
	};
	return n.value = e, n.attached = _o(), n;
}
var yo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, bo = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? Wa(e, r, c) : t === "style" ? Za(e, n, r) : a(t) ? o(t) || uo(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : xo(e, t, r, c)) ? (oo(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || ao(e, t, r, c, s, t !== "value")) : e._isVueCE && (So(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? oo(e, D(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), ao(e, t, r, c));
};
function xo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && yo(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return yo(t) && g(n) ? !1 : t in e;
}
function So(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = D(t);
	return Array.isArray(n) ? n.some((e) => D(e) === r) : Object.keys(n).some((e) => D(e) === r);
}
var Co = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => M(t, e) : t;
};
function wo(e) {
	e.target.composing = !0;
}
function To(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var Eo = /* @__PURE__ */ Symbol("_assign"), Do = /* @__PURE__ */ Symbol("_initialValue");
function Oo(e, t, n) {
	return t && (e = e.trim()), n && (e = ie(e)), e;
}
var Z = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[Do] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Do] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[Eo] = Co(i);
		let a = r || i.props && i.props.type === "number";
		so(e, t ? "change" : "input", (t) => {
			t.target.composing || e[Eo](Oo(e.value, n, a));
		}), (n || a) && so(e, "change", () => {
			e.value = Oo(e.value, n, a);
		}), t || (so(e, "compositionstart", wo), so(e, "compositionend", To), so(e, "change", To));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[Do];
		delete e[Do], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[Eo](Oo(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[Eo] = Co(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? ie(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, ko = {
	deep: !0,
	created(e, t, n) {
		e[Eo] = Co(n), so(e, "change", () => {
			let t = e._modelValue, n = Po(e), r = e.checked, i = e[Eo];
			if (d(t)) {
				let e = be(t, n), a = e !== -1;
				if (r && !a) i(t.concat(n));
				else if (!r && a) {
					let n = [...t];
					n.splice(e, 1), i(n);
				}
			} else if (p(t)) {
				let e = new Set(t);
				r ? e.add(n) : e.delete(n), i(e);
			} else i(Fo(e, r));
		});
	},
	mounted: Ao,
	beforeUpdate(e, t, n) {
		e[Eo] = Co(n), Ao(e, t, n);
	}
};
function Ao(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = be(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = ye(t, Fo(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var jo = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, so(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? ie(Po(e)) : Po(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[Eo](i);
			} finally {
				bn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[Eo] = Co(r);
	},
	mounted(e, { value: t, modifiers: { number: n } }) {
		No(e, t, n);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[Eo] = Co(n);
	},
	updated(e, { value: t, modifiers: { number: n } }) {
		let r = e._pendingValue;
		e._pendingValue = void 0, r && r[0] === e.multiple && Mo(t, r[1], r[0]) || No(e, t, n);
	}
};
function Mo(e, t, n) {
	if (!n || d(e)) return ye(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function No(e, t, n = !1) {
	let r = e.multiple, i = d(t);
	if (!r || i || p(t)) {
		for (let a = 0, o = e.options.length; a < o; a++) {
			let o = e.options[a], s = Po(o);
			if (r) {
				if (i) {
					let e = typeof s;
					o.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(s)) : be(t, s) > -1;
				} else o.selected = t.has(s) || n && typeof s == "string" && t.has(ie(s));
			} else if (ye(Po(o), t)) {
				e.selectedIndex !== a && (e.selectedIndex = a);
				return;
			}
		}
		!r && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function Po(e) {
	return "_value" in e ? e._value : e.value;
}
function Fo(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Io = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Lo = {
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
	exact: (e, t) => Io.some((n) => e[`${n}Key`] && !t.includes(n))
}, Ro = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Lo[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, zo = /* @__PURE__ */ s({ patchProp: bo }, Ha), Bo;
function Vo() {
	return Bo ||= Mi(zo);
}
var Ho = ((...e) => {
	let t = Vo().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Wo(e);
		if (!r) return;
		let i = t._component;
		h(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Uo(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function Uo(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Wo(e) {
	return g(e) ? document.querySelector(e) : e;
}
var Go = "scene_diary", Ko = [
	"preference",
	"habit",
	"promise",
	"relationship",
	"event",
	"item_place"
], qo = "你是 {{char}} 的恋爱陪伴日记整理器。只依据角色设定与 [本幕对话]，以第一人称写日记；不要补写事实。", Jo = Object.freeze({
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
		diary: qo,
		memory: "你是恋爱陪伴记忆提取器。只依据 [本幕对话] 提取已发生或已明确确认的事实。承诺已经作出可以记录，但承诺内容未发生时不得写成已经完成。不要补写事实。",
		growth: "你是 {{char}} 的角色成长与恋爱关系发展整理器。根据 [当前角色成长] 和 [本幕对话]，重写截至本幕结束的完整角色成长记录。重点维护 {{char}} 的性格成长、情感变化、生活状态变化，以及 {{char}} 与 {{user}} 从相识至今的关系发展路径。说明重要经历如何影响角色及双方关系，但不要逐条复述剧情，不要补写未发生或未确认的变化，也不要假定下一幕与本幕在时间、地点或事件上连续。",
		maintenance: "你是记忆库语义整理器。素材只有提供的已保存记忆及关联，不读取或补写外部事实。寻找同一事实的重复表达并建议合并；不同时间分别成立、发展、兑现、取消的事实保持独立并建议关联。仅人物或地点相同不足以关联。所有结果只是供用户批准的建议。"
	}
}), Yo = (e) => Array.isArray(e) ? e : [], Q = (e) => e == null ? "" : String(e).trim(), Xo = (e, t, n, r) => Math.min(n, Math.max(t, Number.isFinite(+e) ? +e : r));
function Zo(e) {
	return (typeof e == "number" || typeof e == "string" && e.trim()) && Number.isFinite(+e) ? Xo(e, 0, 1, Jo.recallScoreThreshold) : Jo.recallScoreThreshold;
}
var Qo = () => Date.now();
function $o(e = "sd") {
	return `${e}_${crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
}
function es() {
	return {
		timestamp: Qo(),
		timezoneOffset: (/* @__PURE__ */ new Date()).getTimezoneOffset()
	};
}
function ts() {
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
function ns(e = {}) {
	let t = e && typeof e == "object" ? e : {};
	return {
		...ts(),
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
function rs(e = 1, t = Qo()) {
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
function is(e = Qo()) {
	return {
		version: 6,
		currentActId: 1,
		status: "active",
		acts: [rs(1, e)],
		memories: [],
		memoryRevision: 0,
		memorySpaceId: $o("space"),
		memoryLinks: [],
		memoryOrganization: null,
		maintenanceTransaction: null,
		characterGrowth: ts(),
		pendingTransaction: null,
		drafts: [],
		settings: structuredClone(Jo),
		lastUpdatedAt: e
	};
}
function as(e) {
	let t = Q(e?.open), n = Q(e?.close), r = t.match(/^<([A-Za-z][A-Za-z0-9:_-]*)>$/), i = n.match(/^<\/([A-Za-z][A-Za-z0-9:_-]*)>$/);
	return r && i && r[1] === i[1] ? {
		open: t,
		close: n
	} : null;
}
var os = (e) => Yo(e).map((e) => ({
	open: `<${Q(e).replace(/^<|>$/g, "")}>`,
	close: `</${Q(e).replace(/^<|>$/g, "")}>`
})), ss = (e, t) => Yo(e).length ? Yo(e).map(as).filter(Boolean) : os(t).map(as).filter(Boolean), cs = (e) => ({
	bodyTagPairs: ss(e?.bodyTagPairs, e?.bodyTags),
	storyTimeTagPairs: ss(e?.storyTimeTagPairs, e?.storyTimeTags),
	requiredStoryTime: !!e?.requiredStoryTime
});
function ls(e = {}) {
	let { growthTargetLength: t, diaryTokenBudget: n, ...r } = e;
	return {
		...Jo,
		...r,
		recentDiaryCount: Xo(e.recentDiaryCount, 0, 20, 2),
		recallMessageCount: Xo(e.recallMessageCount, 1, 20, 3),
		recallLimit: Xo(e.recallLimit, 0, 30, 8),
		recallScoreThreshold: Zo(e.recallScoreThreshold),
		maintenanceConnectionProfile: Q(e.maintenanceConnectionProfile),
		maintenanceCandidateLimit: Math.trunc(Xo(e.maintenanceCandidateLimit, 1, 60, 20)),
		maintenanceScoreThreshold: (typeof e.maintenanceScoreThreshold == "number" || typeof e.maintenanceScoreThreshold == "string" && e.maintenanceScoreThreshold.trim()) && Number.isFinite(+e.maintenanceScoreThreshold) ? Xo(e.maintenanceScoreThreshold, 0, 1, .15) : .15,
		maxGrowthChars: Jo.maxGrowthChars,
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
			user: cs(e.extraction?.user || Jo.extraction.user),
			character: cs(e.extraction?.character || Jo.extraction.character)
		},
		prompts: {
			diary: Q(e.prompts?.diary) || "你是 {{char}} 的恋爱陪伴日记整理器。只依据角色设定与 [本幕对话]，以第一人称写日记；不要补写事实。",
			memory: Q(e.prompts?.memory) || "你是恋爱陪伴记忆提取器。只依据 [本幕对话] 提取已发生或已明确确认的事实。承诺已经作出可以记录，但承诺内容未发生时不得写成已经完成。不要补写事实。",
			growth: Q(e.prompts?.growth) || "你是 {{char}} 的角色成长与恋爱关系发展整理器。根据 [当前角色成长] 和 [本幕对话]，重写截至本幕结束的完整角色成长记录。重点维护 {{char}} 的性格成长、情感变化、生活状态变化，以及 {{char}} 与 {{user}} 从相识至今的关系发展路径。说明重要经历如何影响角色及双方关系，但不要逐条复述剧情，不要补写未发生或未确认的变化，也不要假定下一幕与本幕在时间、地点或事件上连续。",
			maintenance: Q(e.prompts?.maintenance) || "你是记忆库语义整理器。素材只有提供的已保存记忆及关联，不读取或补写外部事实。寻找同一事实的重复表达并建议合并；不同时间分别成立、发展、兑现、取消的事实保持独立并建议关联。仅人物或地点相同不足以关联。所有结果只是供用户批准的建议。"
		}
	};
}
function us(e = {}) {
	let { sources: t, sourceActId: n, sourceMessageIds: r, lifecycle: i, supersedes: a, mergedInto: o, revision: s, status: c, dirty: l, reviewRecommended: u, sourceFingerprint: d, accepted: f, disabled: p, ...m } = e, h = es();
	return {
		...m,
		id: Q(e.id) || $o("memory"),
		category: Ko.includes(e.category) ? e.category : "event",
		title: Q(e.title).slice(0, 120),
		content: Q(e.content),
		people: [...new Set(Yo(e.people).map(Q).filter(Boolean))],
		aliases: [...new Set(Yo(e.aliases).map(Q).filter(Boolean))],
		importance: Math.round(Xo(e.importance, 1, 5, 3)),
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
function ds(e) {
	let t = is(), n = e && typeof e == "object" ? e : {}, r = Number.isFinite(+n.version) ? +n.version : 0;
	if (r > 6) throw Error(`聊天数据版本 ${n.version} 高于支持版本 6`);
	let { maintenanceHistory: i, ...a } = n, o = Yo(n.acts).map((e, t) => ({
		...rs(+e?.id || t + 1, +e?.createdAt || Qo()),
		...e,
		id: +e?.id || t + 1,
		messageIds: Yo(e?.messageIds).map(String),
		status: [
			"active",
			"closing",
			"closed"
		].includes(e?.status) ? e.status : "active"
	})), s = o.length ? o : t.acts, c = s.some((e) => e.id === +n.currentActId) ? +n.currentActId : s.at(-1).id, l = Yo(n.memories).filter((e) => e && !e.deletedAt && !["archived", "superseded"].includes(e.lifecycle)).map(us), u = n.pendingTransaction ? structuredClone(n.pendingTransaction) : null;
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
		memoryRevision: +n.memoryRevision || 0,
		memorySpaceId: Q(n.memorySpaceId) || t.memorySpaceId,
		pendingTransaction: u,
		characterGrowth: ns(n.characterGrowth && typeof n.characterGrowth == "object" ? n.characterGrowth : n.summary),
		settings: ls(n.settings),
		drafts: Yo(n.drafts)
	};
}
var fs = (e) => Yo(e?.acts).find((t) => t.id === e.currentActId) || Yo(e?.acts).at(-1) || null, ps = (e, t) => Yo(e?.acts).find((e) => e.id === +t) || null;
function ms(e) {
	let t = 2166136261;
	for (let n of String(e ?? "")) t ^= n.charCodeAt(0), t = Math.imul(t, 16777619);
	return (t >>> 0).toString(16);
}
function hs(e) {
	return ms(Yo(e).map((e) => `${e?.extra?.scene_diary?.messageId || ""}:${e?.mes || ""}`).join("\n"));
}
function gs(e, t, n = null) {
	e.extra ||= {}, e.extra.scene_diary ||= {};
	let r = e.extra.scene_diary;
	return r.messageId ||= $o("msg"), t != null && (r.actId = +t), n != null && (r.messageIndex = +n), r;
}
function _s(e) {
	return !!e && !e.is_system && e.extra?.type !== "narrator" && !e.extra?.tool_invocations && !e.extra?.scene_diary?.injected && !e.is_hidden;
}
function vs(e, t, n, r = null) {
	let i = gs(t, n, r).messageId, a = ps(e, n);
	return a && !a.messageIds.includes(i) && a.messageIds.push(i), i;
}
function ys(e, t, n = null) {
	let r = fs(e), i = rs(Math.max(...e.acts.map((e) => e.id), 0) + 1);
	return i.startMessageIndex = n, e.acts.push(i), e.currentActId = i.id, e.status = "active", r && (r.status = "closed"), t && vs(e, t, i.id, n), i;
}
function bs(e, t) {
	return Yo(e).filter((e) => !_s(e) || +e.extra?.scene_diary?.actId == +t);
}
function xs(e, t) {
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
function Ss(e, t, n) {
	return ss(e?.[t], e?.[n]);
}
function Cs(e, t) {
	let n = String(e || ""), r = Ss(t, "bodyTagPairs", "bodyTags"), i = r.flatMap((e) => xs(n, e)).sort((e, t) => e.index - t.index), a = r.length ? i.map((e) => e.value.trim()).filter(Boolean).filter((e, t, n) => !n.slice(0, t).some((t) => t.includes(e))).join("\n\n") : n.trim(), o = Ss(t, "storyTimeTagPairs", "storyTimeTags").flatMap((e) => xs(n, e)).sort((e, t) => e.index - t.index).map((e) => e.value.replace(/<[^>]*>/g, " ").trim()).find(Boolean) || null, s = [];
	return r.length && !i.length && s.push("未匹配任何正文标签对"), a || s.push("提取后的正文为空"), t?.requiredStoryTime && !o && s.push("未匹配必填故事时间标签对"), {
		body: a,
		storyTime: o,
		errors: s
	};
}
function ws(e, t, n, r) {
	let i = [], a = [];
	for (let o of Yo(e)) {
		let e = Cs(o.mes, o.is_user ? t.user : t.character), s = o.extra?.scene_diary?.messageId || "";
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
function Ts(e, t) {
	let n = [], r = [];
	for (let i of Yo(e)) {
		if (!_s(i) || !Q(i.mes)) continue;
		let e = Cs(i.mes, i.is_user ? t.user : t.character), a = i.extra?.scene_diary?.messageId || "";
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
function Es(e, t) {
	return String(e || "").replace(/{{(char|user)}}/g, (e, n) => String(t[n] ?? ""));
}
function Ds(e = {}) {
	return [
		["角色描述", e.description],
		["性格", e.personality],
		["当前场景", e.scenario]
	].filter(([, e]) => Q(e)).map(([e, t]) => `[${e}]\n${Q(t)}`).join("\n\n");
}
function Os(e) {
	let t = String(e || "").toLocaleLowerCase(), n = [];
	try {
		if (Intl.Segmenter) for (let e of new Intl.Segmenter("zh", { granularity: "word" }).segment(t)) e.isWordLike && e.segment.trim() && n.push(e.segment);
	} catch {}
	for (let e of t.match(/[\u4e00-\u9fff]{2,}/g) || []) for (let t = 0; t < e.length - 1; t++) n.push(e.slice(t, t + 2));
	return [.../* @__PURE__ */ new Set([...n, ...t.split(/[^\p{L}\p{N}_-]+/u).filter((e) => e.length > 1)])];
}
var ks = (e) => `${e.content}${e.storyTime ? `（故事时间：${e.storyTime}）` : ""}`;
function As(e, t) {
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
var js = (e) => String(e ?? "").trim(), Ms = (e) => js(e.content), Ns = /* @__PURE__ */ new Map();
function Ps(e, t) {
	let n = `${t}:${ms(e.map((e) => `${e.id}\u0000${Ms(e)}`).join(""))}`;
	if (Ns.has(n)) return Ns.get(n);
	let r = e.map((e) => {
		let t = Os(Ms(e)), n = /* @__PURE__ */ new Map();
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
	return Ns.set(n, a), Ns.size > 3 && Ns.delete(Ns.keys().next().value), a;
}
function Fs(e) {
	let t = e[0]?.score || 1;
	return e.map((e) => ({
		...e,
		relevance: Math.min(e.score / t, e.evidenceRelevance)
	}));
}
var Is = (e, t) => {
	if (!e || !t || e.length !== t.length) return 0;
	let n = 0, r = 0, i = 0;
	for (let a = 0; a < e.length; a++) n += e[a] * t[a], r += e[a] ** 2, i += t[a] ** 2;
	return r && i ? n / Math.sqrt(r * i) : 0;
};
function Ls(e, t = null, { poolSize: n = 30 } = {}) {
	let r = e.filter((e) => e && !e.deletedAt && !e.permanent), i = Ps(r, t), a = new Map(r.map((e) => [e.id, e]));
	return (e, { vectors: t = /* @__PURE__ */ new Map(), queryVector: o = null } = {}) => {
		let s = Os(e), c = i.docs.map((t) => {
			let n = s.filter((e) => t.tf.has(e)), o = js(t.memory.content) && e.toLowerCase().includes(js(t.memory.content).toLowerCase()), c = n.reduce((e, n) => {
				let a = t.tf.get(n), o = i.df.get(n);
				return e + Math.log(1 + (r.length - o + .5) / (o + .5)) * a * 2.2 / (a + 1.2 * (.25 + .75 * t.length / Math.max(1, i.average)));
			}, 0) + (o ? 2 : 0);
			return {
				memory: a.get(t.memory.id),
				score: c,
				evidenceRelevance: c / (c + .5),
				hits: n,
				source: o ? "exact" : "lexical"
			};
		}).sort((e, t) => t.score - e.score || e.memory.id.localeCompare(t.memory.id)).slice(0, n), l = o ? r.filter((e) => t.has(e.id)).map((e) => {
			let n = Is(o, t.get(e.id));
			return {
				memory: e,
				score: n,
				evidenceRelevance: Math.max(0, Math.min(1, n)),
				hits: [],
				source: "vector"
			};
		}).sort((e, t) => t.score - e.score || e.memory.id.localeCompare(t.memory.id)).slice(0, n) : [], u = /* @__PURE__ */ new Map();
		for (let [e, t] of [["lexical", c], ["vector", l]]) t.forEach((t, n) => {
			if (t.evidenceRelevance <= 0) return;
			let r = u.get(t.memory.id) || {
				...t,
				score: 0,
				evidenceRelevance: 0,
				channels: []
			};
			r.score += 1 / (60 + n + 1), r.evidenceRelevance = Math.max(r.evidenceRelevance, t.evidenceRelevance), r.channels.push(e), u.set(t.memory.id, r);
		});
		return Fs([...u.values()].sort((e, t) => t.score - e.score || e.memory.id.localeCompare(t.memory.id)).slice(0, n));
	};
}
// semantic.js
var Rs = "scene_diary_vectors_v1", zs = "vectors", Bs = () => new Promise((e, t) => {
	let n = indexedDB.open(Rs, 1);
	n.onupgradeneeded = () => n.result.createObjectStore(zs), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
}), Vs = (e, t, n) => [
	"content-only-v1",
	e.account,
	e.chat,
	e.space,
	t.endpoint,
	t.model,
	t.dimensions || "",
	n.id,
	ms(Ms(n))
].join("|");
function Hs(e, t = "向量") {
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
function Us(e, t = []) {
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
async function Ws(e, t, n) {
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
		throw Error(Us(`${t}服务返回 HTTP ${e.status}${a ? `（${a}）` : ""}${i ? `：${i}` : ""}`, [n]));
	}
	try {
		return await e.json();
	} catch (e) {
		throw e?.name === "AbortError" ? e : Error(`${t}响应不是有效 JSON：${Us(e, [n])}`);
	}
}
async function Gs(e, t, n, r, { signal: i } = {}) {
	let a = Hs(n.rerankEndpoint, "重排");
	if (!n.rerankModel) throw Error("未设置重排模型");
	if (!t.length) return [];
	let o = (await Ws(await fetch(a, {
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
async function Ks(e, t, n, { signal: r } = {}) {
	let i = Hs(t.endpoint);
	if (!t.model) throw Error("未设置向量模型");
	let a = await Ws(await fetch(i, {
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
async function qs(e, t, n) {
	if (!e.length) return /* @__PURE__ */ new Map();
	let r = await Bs();
	try {
		let i = r.transaction(zs).objectStore(zs), a = await Promise.all(e.map((e) => new Promise((r, a) => {
			let o = i.get(Vs(t, n, e));
			o.onsuccess = () => r([e.id, o.result]), o.onerror = () => a(o.error);
		})));
		return new Map(a.filter(([, e]) => Array.isArray(e)));
	} finally {
		r.close();
	}
}
async function Js(e, t, n, r) {
	let i = await Bs();
	try {
		await new Promise((a, o) => {
			let s = i.transaction(zs, "readwrite"), c = s.objectStore(zs);
			s.oncomplete = a, s.onerror = s.onabort = () => o(s.error || /* @__PURE__ */ Error("向量缓存写入中止")), e.forEach((e, i) => c.put(t[i], Vs(n, r, e)));
		});
	} finally {
		i.close();
	}
}
// src/workspace.ts
function Ys(e) {
	let t = /* @__PURE__ */ Kt(e.snapshot()), n = /* @__PURE__ */ z(!1), r = /* @__PURE__ */ z("workbench"), i = /* @__PURE__ */ z(""), a = /* @__PURE__ */ z(""), o = t.value.chatId;
	e.subscribe((e) => {
		t.value = e, Yt(t), e.chatId !== o && (o = e.chatId, r.value = "workbench", i.value = "", a.value = "");
	});
	async function s(n) {
		i.value = "", a.value = "";
		let r = o;
		try {
			return await n();
		} catch (n) {
			if (r === o && n?.name !== "AbortError" && !t.value.saveError) {
				let r = t.value.channels.map((e) => e.key), a = e.getContext().accountStorage;
				i.value = Us(n, [
					...r,
					a?.getItem("scene_diary_embedding_key"),
					a?.getItem("scene_diary_rerank_key")
				]);
			}
		}
	}
	return {
		host: e,
		view: t,
		opened: n,
		page: r,
		error: i,
		notice: a,
		run: s,
		openWorkbench: () => {
			r.value = "workbench", n.value = !0, bn(() => document.getElementById("sd-title")?.focus());
		},
		select: (e) => {
			r.value = e, i.value = "", a.value = "";
		}
	};
}
var Xs = Symbol("scene-diary"), Zs = () => Ln(Xs);
function Qs(e, t) {
	let n = URL.createObjectURL(new Blob([JSON.stringify(e, null, 2)], { type: "application/json" })), r = document.createElement("a");
	r.href = n, r.download = t, r.click(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
var $s = {
	preference: "偏好",
	npc_relationship: "NPC 关系",
	item: "重要物品",
	place: "地点"
}, ec = (e) => typeof e == "string" ? e.trim() : "";
function tc(e) {
	return {
		...us(e),
		category: e.category,
		needsClassification: !Object.hasOwn($s, e.category)
	};
}
function nc(e) {
	return {
		id: e.id || $o("diary"),
		title: ec(e.title) || "未命名日记",
		body: typeof e.body == "string" ? e.body : "",
		summary: ec(e.summary),
		summaryPending: !!e.summaryPending || !ec(e.summary),
		needsReview: !!e.needsReview,
		createdAt: Number(e.createdAt) || Date.now(),
		updatedAt: Number(e.updatedAt) || Date.now()
	};
}
function rc(e = {}) {
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
function ic(e) {
	if (e.version === 7) return e;
	let t = ds(e), { memoryLinks: n, memoryOrganization: r, maintenanceTransaction: i, ...a } = t, o = t.acts.filter((e) => ec(e.diary)).map((e) => nc({
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
						id: e.id || $o("proposal"),
						action: "new",
						targetId: null,
						value: tc(e),
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
		memories: t.memories.map(tc),
		edges: [],
		graphReviewed: {},
		graphPreview: null,
		pendingTransaction: l,
		status: l ? "preview" : t.status === "pending_next_act" ? t.status : "active",
		settings: rc({
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
function ac(e, t, { actId: n = e.characterGrowth.lastIncludedActId, edited: r = !0 } = {}) {
	let i = es();
	e.characterGrowth = {
		...e.characterGrowth,
		content: ec(t),
		edited: r,
		lastIncludedActId: n,
		createdAt: e.characterGrowth.createdAt || i.timestamp,
		updatedAt: i.timestamp,
		timezoneOffset: i.timezoneOffset,
		revision: e.characterGrowth.revision + 1,
		reviewRecommended: !1
	};
}
var oc = {
	diary: "日记",
	memory: "记忆提取",
	growth: "角色成长"
}, sc = ["diary", "memory"], $ = (e) => typeof e == "string" ? e.trim() : "", cc = (e) => !!e && !e.deletedAt && !!$(e.content), lc = {
	diary: ["你是 {{char}} 的日记整理助手。", "以角色第一人称写下本幕经历、关键互动与当时感受，只使用给定素材。"],
	memory: ["你是独立记忆点整理助手。", "提取对未来对话有价值且能独立理解的事实。只依据已发生或已确认的内容，故事时间无依据时留空。"],
	growth: ["你是 {{char}} 的角色画像整理助手。", "结合角色设定和日记维护完整的当前画像，保留有依据的人格、关系与生活状态变化。没有实质变化时如实说明。"]
}, uc = {
	diary: qo,
	memory: "抽取对未来对话有直接价值的客观事实。",
	growth: "保持人物当前状态和长期连续性，仅采纳已确认的实质变化。"
}, dc = (e, t) => Number.isSafeInteger(e) && e >= 0 ? e : t;
function fc(e = {}) {
	let t = ls(e), n = {}, r = {};
	for (let t of Object.keys(oc)) {
		let i = e.prompts?.[t], [a, o] = lc[t];
		n[t] = {
			system: i?.system ?? a,
			description: i?.description ?? (typeof i == "string" && i !== uc[t] ? i : o)
		}, t === "growth" && (n.growth.globalDescription = i?.globalDescription ?? "根据角色设定和全部有效日记重建 {{char}} 的完整当前画像。以日记中有依据的人格、关系与生活状态为准，结合前后变化整理至最新状态。素材足以建立画像时，返回完整候选画像。"), e.bindings?.[t] && (r[t] = e.bindings[t]);
	}
	return {
		prompts: n,
		bindings: r,
		extraction: t.extraction,
		semantic: t.semantic,
		growthEnabled: e.growthEnabled !== !1,
		recentDiaryCount: dc(e.recentDiaryCount, 2),
		growthDiaryCount: dc(e.growthDiaryCount, 3),
		queryDepth: dc(e.queryDepth, dc(e.recallMessageCount - 1, 2)),
		retrievalCount: dc(e.retrievalCount, 30),
		candidateCount: dc(e.candidateCount, e.recallLimit === 8 ? 10 : dc(e.recallLimit, 10)),
		recallScoreThreshold: t.recallScoreThreshold
	};
}
function pc(e = {}) {
	return {
		id: e.id || $o("fact"),
		title: $(e.title),
		content: $(e.content),
		storyTime: $(e.storyTime) || null,
		importance: e.importance ?? 3,
		locked: !!e.locked,
		permanent: !!e.permanent,
		updatedAt: e.updatedAt ?? Date.now()
	};
}
function mc(e) {
	return {
		...pc(e),
		title: e.title,
		content: e.content
	};
}
var hc = (e) => cc(e) && !!$(e.title) && Number.isInteger(e.importance) && e.importance >= 1 && e.importance <= 5;
function gc(e = {}) {
	return {
		id: e.id || $o("diary"),
		title: $(e.title) || "未命名日记",
		body: e.body ?? "",
		needsReview: !!e.needsReview,
		createdAt: e.createdAt ?? Date.now(),
		updatedAt: e.updatedAt ?? Date.now()
	};
}
function _c(e) {
	if (e.version === 8) return e;
	let t = ic(e), { edges: n, graphReviewed: r, graphPreview: i, ...a } = t, o = t.pendingTransaction, s = o?.results?.growth?.value, c = null;
	if (o) {
		let { growthRevision: e, results: t, ...n } = o, r = { ...t.memory }, i = { ...t.diary };
		i.value &&= {
			title: i.value.title,
			body: i.value.body
		}, Array.isArray(r.value) && (r.value.some((e) => e.targetId && e.accepted) && (r.status = "draft"), r.value = r.value.map((e) => ({
			id: e.id,
			value: pc(e.value),
			accepted: !!e.accepted && !e.targetId && e.action !== "duplicate"
		})));
		for (let e of [i, r]) e.status === "running" && Object.assign(e, {
			status: "error",
			error: "上次生成已中断，可单独重试本项。"
		});
		c = {
			...n,
			results: {
				diary: i,
				memory: r
			}
		};
	}
	return {
		...a,
		version: 8,
		settings: fc(t.settings),
		diaries: t.diaries.map(gc),
		memories: t.memories.filter(cc).map(mc),
		pendingTransaction: c,
		legacyGrowthDraft: s?.changed && $(s.content) ? s.content : null
	};
}
var vc = () => ({
	..._c(is()),
	connectionSetupNeeded: !1
});
function yc(e, t, n = null) {
	let r = n ? e.memories.findIndex((e) => e.id === n) : -1;
	if (n && r < 0) throw Error("记忆点已删除。");
	if (e.memories[r]?.locked) throw Error("请先解锁记忆点。");
	let i = pc({
		...t,
		id: n || t.id,
		updatedAt: Date.now()
	});
	if (!hc(i)) throw Error("请填写标题、内容和 1–5 的整数重要度。");
	return r < 0 ? e.memories.push(i) : e.memories[r] = i, e.memoryRevision++, i;
}
function bc(e, t) {
	return {
		format: "scene-diary-content",
		version: 4,
		chatId: String(t),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		diaries: structuredClone(e.diaries),
		memories: structuredClone(e.memories),
		characterGrowth: structuredClone(e.characterGrowth)
	};
}
function xc(e, t, n) {
	if (t?.format !== "scene-diary-content" || ![
		2,
		3,
		4
	].includes(t.version) || String(n) !== t.chatId) throw Error("备份格式、版本或聊天身份不匹配。");
	if (!Array.isArray(t.diaries) || !Array.isArray(t.memories) || typeof t.characterGrowth?.content != "string") throw Error("备份缺少必需字段。");
	let r = t.version === 2, i = (e) => e.every((e) => typeof e == "string" && e) && new Set(e).size === e.length;
	if (!i(t.diaries.map((e) => r ? Number.isInteger(e?.actId) ? String(e.actId) : "" : e?.id)) || !t.diaries.every((e) => $(r ? e?.diary : e?.body)) || !i(t.memories.map((e) => e?.id)) || !t.memories.every((e) => $(e?.title) && $(e?.content))) throw Error("备份包含重复 ID 或无效条目。");
	let a = t.memories.filter(cc).map(mc), o = new Map(e.acts.map((e) => [e.id, e.closedAt || e.createdAt])), s = Date.parse(t.createdAt) || Date.now(), c = t.diaries.map((e, t) => gc(r ? {
		title: e.title,
		body: e.diary,
		needsReview: e.dirty,
		createdAt: o.get(e.actId) || s + t
	} : e));
	if (!a.every(hc)) throw Error("备份包含无效记忆。");
	return {
		...e,
		diaries: c,
		memories: a,
		memoryRevision: e.memoryRevision + 1,
		characterGrowth: {
			...e.characterGrowth,
			...t.characterGrowth,
			revision: e.characterGrowth.revision + 1
		}
	};
}
// src/TextField.vue?vue&type=script&setup=true&lang.ts
var Sc = { class: "sd-field" }, Cc = ["rows", "readonly"], wc = /* @__PURE__ */ Qn({
	__name: "TextField",
	props: /*@__PURE__*/ Nr({
		label: {},
		rows: {},
		readonly: { type: Boolean }
	}, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = $r(e, "modelValue");
		return (n, r) => (U(), W("label", Sc, [G("span", null, N(e.label), 1), V(G("textarea", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			rows: e.rows || 6,
			readonly: e.readonly
		}, null, 8, Cc), [[Z, t.value]])]));
	}
}), Tc = {
	key: 0,
	class: "sd-subcard sd-stack"
}, Ec = {
	key: 0,
	class: "sd-raw-response",
	tabindex: "0"
}, Dc = { key: 1 }, Oc = /* @__PURE__ */ Qn({
	__name: "RawResponse",
	props: { content: {} },
	setup(e) {
		return (t, n) => e.content === void 0 ? J("", !0) : (U(), W("section", Tc, [n[0] ||= G("h4", null, "大模型原始回复", -1), e.content ? (U(), W("pre", Ec, N(e.content), 1)) : (U(), W("p", Dc, "模型返回了空文本。"))]));
	}
}), kc = { class: "sd-card sd-stack" }, Ac = { class: "sd-section-title" }, jc = { class: "sd-pill" }, Mc = {
	key: 0,
	class: "sd-alert"
}, Nc = { class: "sd-field" }, Pc = { key: 0 }, Fc = { class: "sd-stack" }, Ic = ["onUpdate:modelValue"], Lc = ["onUpdate:modelValue"], Rc = { class: "sd-field" }, zc = ["onUpdate:modelValue"], Bc = { class: "sd-form-grid" }, Vc = { class: "sd-field" }, Hc = ["onUpdate:modelValue"], Uc = { class: "sd-field" }, Wc = ["onUpdate:modelValue"], Gc = {
	key: 3,
	class: "sd-actions"
}, Kc = {
	key: 4,
	class: "sd-actions"
}, qc = /* @__PURE__ */ Qn({
	__name: "Review",
	props: {
		kind: {},
		part: {},
		transaction: {}
	},
	setup(e) {
		let t = e, { view: n, host: r, run: i, select: a } = Zs(), o = /* @__PURE__ */ z(), s = () => t.kind === "diary" ? {
			title: "",
			body: ""
		} : [];
		Vn(() => JSON.stringify(t.part.value), () => {
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
		}, l = X(() => n.value.busy.includes("close:" + t.kind)), u = X(() => n.value.channels.some((e) => e.id === n.value.state?.settings.bindings[t.kind]));
		function d(e = !1, n = !0) {
			return i(() => r.reviewPart(t.kind, JSON.parse(JSON.stringify(o.value)), e, n));
		}
		return (t, s) => (U(), W("article", kc, [
			G("header", Ac, [G("h3", null, N(B(oc)[e.kind]), 1), G("span", jc, N(c[e.part.status]), 1)]),
			e.part.error ? (U(), W("p", Mc, N(e.part.error), 1)) : J("", !0),
			e.part.status === "error" ? (U(), ea(Oc, {
				key: 1,
				content: B(n).closeRawResponses[e.kind]
			}, null, 8, ["content"])) : J("", !0),
			l.value ? J("", !0) : (U(), W(H, { key: 2 }, [e.kind === "diary" ? (U(), W(H, { key: 0 }, [G("label", Nc, [s[8] ||= q("标题", -1), V(G("input", { "onUpdate:modelValue": s[0] ||= (e) => o.value.title = e }, null, 512), [[Z, o.value.title]])]), K(wc, {
				modelValue: o.value.body,
				"onUpdate:modelValue": s[1] ||= (e) => o.value.body = e,
				label: "第一人称正文",
				rows: 9
			}, null, 8, ["modelValue"])], 64)) : (U(), W(H, { key: 1 }, [e.part.value && !o.value.length ? (U(), W("p", Pc, "本幕没有合格事实。")) : J("", !0), (U(!0), W(H, null, Dr(o.value, (e) => (U(), W("details", {
				class: "sd-subcard",
				key: e.id,
				open: ""
			}, [G("summary", null, "新增 · " + N(e.value.title), 1), G("div", Fc, [
				G("label", null, [V(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": (t) => e.accepted = t
				}, null, 8, Ic), [[ko, e.accepted]]), s[9] ||= q(" 保存此记忆点", -1)]),
				G("label", null, [V(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": (t) => e.value.permanent = t
				}, null, 8, Lc), [[ko, e.value.permanent]]), s[10] ||= q(" 常驻记忆", -1)]),
				G("label", Rc, [s[11] ||= q("标题", -1), V(G("input", { "onUpdate:modelValue": (t) => e.value.title = t }, null, 8, zc), [[Z, e.value.title]])]),
				K(wc, {
					modelValue: e.value.content,
					"onUpdate:modelValue": (t) => e.value.content = t,
					label: "拟保存内容",
					rows: 3
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				G("div", Bc, [G("label", Vc, [s[12] ||= q("故事时间", -1), V(G("input", { "onUpdate:modelValue": (t) => e.value.storyTime = t }, null, 8, Hc), [[Z, e.value.storyTime]])]), G("label", Uc, [s[13] ||= q("重要度", -1), V(G("input", {
					type: "number",
					"onUpdate:modelValue": (t) => e.value.importance = t,
					min: "1",
					max: "5"
				}, null, 8, Wc), [[
					Z,
					e.value.importance,
					void 0,
					{ number: !0 }
				]])])])
			])]))), 128))], 64))], 64)),
			l.value ? (U(), W("div", Gc, [G("button", { onClick: s[2] ||= (t) => B(r).cancel("close:" + e.kind) }, "取消本项请求")])) : (U(), W("div", Kc, [
				u.value ? (U(), W("button", {
					key: 0,
					onClick: s[3] ||= (t) => B(i)(() => B(r).runClose(e.kind))
				}, N(e.part.status === "idle" ? "生成" : "重新生成"), 1)) : (U(), W("button", {
					key: 1,
					onClick: s[4] ||= (e) => B(a)("settings")
				}, "配置渠道")),
				e.kind !== "memory" || e.part.value ? (U(), W("button", {
					key: 2,
					onClick: s[5] ||= (e) => d(!1, !1)
				}, "保存草稿")) : J("", !0),
				e.kind !== "memory" || e.part.value ? (U(), W("button", {
					key: 3,
					class: "sd-primary",
					onClick: s[6] ||= (e) => d()
				}, "确认" + N(B(oc)[e.kind]), 1)) : J("", !0),
				G("button", { onClick: s[7] ||= (e) => d(!0) }, "跳过本项")
			]))
		]));
	}
}), Jc = {
	key: 0,
	class: "sd-card sd-stack"
}, Yc = ["max"], Xc = { class: "sd-hero sd-card" }, Zc = { class: "sd-kicker" }, Qc = { key: 0 }, $c = { key: 1 }, el = { key: 0 }, tl = ["disabled"], nl = {
	key: 0,
	class: "sd-status"
}, rl = {
	key: 1,
	id: "sd-close-review",
	class: "sd-stack"
}, il = { class: "sd-sticky sd-actions" }, al = ["disabled"], ol = { class: "sd-card" }, sl = { class: "sd-actions" }, cl = { class: "sd-file" }, ll = /* @__PURE__ */ Qn({
	__name: "Workbench",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = Zs(), a = /* @__PURE__ */ z(1), o = X(() => t.value.state), s = X(() => fs(o.value)), c = X(() => o.value?.pendingTransaction), l = X(() => sc.every((e) => ["confirmed", "skipped"].includes(c.value?.results[e]?.status))), u = () => document.getElementById("sd-close-review")?.scrollIntoView({ block: "start" }), d = (e) => window.confirm(e), f = (e) => t.value.channels.some((t) => t.id === o.value?.settings.bindings[e]);
		return (e, p) => o.value ? (U(), W(H, { key: 1 }, [
			G("header", Xc, [G("div", null, [
				G("p", Zc, "第 " + N(s.value?.id) + " 幕", 1),
				G("h3", null, N(c.value ? "本幕待审核" : o.value.status === "pending_next_act" ? "本幕已归档" : "当前幕"), 1),
				G("p", null, [
					q(N(s.value?.messageIds.length || 0) + " 条归幕对话", 1),
					s.value?.startMessageIndex == null ? J("", !0) : (U(), W("span", Qc, " · 起始楼层 " + N(s.value.startMessageIndex + 1), 1)),
					s.value?.endMessageIndex == null ? J("", !0) : (U(), W("span", $c, " · 结束楼层 " + N(s.value.endMessageIndex + 1), 1))
				]),
				o.value.status === "pending_next_act" ? (U(), W("p", el, "下一条玩家消息将开启新幕。")) : J("", !0)
			]), !c.value && o.value.status === "active" ? (U(), W("button", {
				key: 0,
				class: "sd-primary",
				disabled: !s.value?.messageIds.length,
				onClick: p[3] ||= (e) => B(r)(B(n).openClose)
			}, "结束这一幕", 8, tl)) : c.value ? (U(), W("button", {
				key: 1,
				class: "sd-primary",
				onClick: u
			}, "继续审核")) : (U(), W("button", {
				key: 2,
				onClick: p[4] ||= (e) => B(i)("diaries")
			}, "查看日记档案"))]),
			o.value.connectionSetupNeeded && Object.keys(B(oc)).some((e) => !f(e)) ? (U(), W("p", nl, [p[13] ||= q(" 旧版连接已停用。请为尚未绑定的日记、记忆提取和成长任务配置自建渠道。 ", -1), G("button", { onClick: p[5] ||= (e) => B(i)("settings") }, "打开设置")])) : J("", !0),
			c.value ? (U(), W("section", rl, [(U(!0), W(H, null, Dr(B(sc), (e) => (U(), ea(qc, {
				key: c.value.id + e,
				kind: e,
				part: c.value.results[e],
				transaction: c.value
			}, null, 8, [
				"kind",
				"part",
				"transaction"
			]))), 128)), G("div", il, [G("button", { onClick: p[6] ||= (e) => B(r)(() => d("取消这次关幕并清除本次审核草稿？") && B(n).cancelClose()) }, "取消关幕"), G("button", {
				class: "sd-primary",
				disabled: !l.value,
				onClick: p[7] ||= (e) => B(r)(B(n).confirmClose)
			}, "确认结束本幕", 8, al)])])) : J("", !0),
			G("details", ol, [p[15] ||= G("summary", null, "备份与恢复", -1), G("div", sl, [
				G("button", { onClick: p[8] ||= (e) => B(r)(() => B(Qs)(B(n).backup(), "scene-diary-" + B(t).chatId + ".json")) }, "导出内容"),
				G("label", cl, [p[14] ||= q("导入内容 ", -1), G("input", {
					type: "file",
					accept: ".json,application/json",
					onChange: p[9] ||= (e) => B(r)(async () => {
						let t = e.target, r = t.files?.[0];
						if (t.value = "", !r) return;
						let i = JSON.parse(await r.text());
						d("确认替换当前聊天的日记、画像和记忆点？") && await B(n).import(i);
					})
				}, null, 32)]),
				G("button", { onClick: p[10] ||= (e) => B(r)(async () => B(Qs)(await B(n).migrationBackup(), "scene-diary-pre-upgrade-" + B(t).chatId + ".json")) }, "导出升级前整聊天备份")
			])])
		], 64)) : (U(), W("div", Jc, [
			G("p", null, N(B(t).blocker), 1),
			B(t).blocker.startsWith("已有聊天") ? (U(), W("form", {
				key: 0,
				class: "sd-actions",
				onSubmit: p[1] ||= Ro((e) => B(r)(() => B(n).takeOver(a.value - 1)), ["prevent"])
			}, [G("label", null, [p[11] ||= q("从楼层 ", -1), V(G("input", {
				"onUpdate:modelValue": p[0] ||= (e) => a.value = e,
				type: "number",
				min: "1",
				max: Math.max(B(t).messages, 1),
				required: ""
			}, null, 8, Yc), [[
				Z,
				a.value,
				void 0,
				{ number: !0 }
			]])]), p[12] ||= G("button", { class: "sd-primary" }, "接管聊天", -1)], 32)) : J("", !0),
			B(t).blocker.startsWith("迁移备份失败") ? (U(), W("button", {
				key: 1,
				onClick: p[2] ||= (e) => B(r)(B(n).initialize)
			}, "重试迁移")) : J("", !0)
		]));
	}
}), ul = ["disabled"], dl = ["role"], fl = /* @__PURE__ */ Qn({
	__name: "SaveAction",
	props: {
		action: { type: Function },
		label: {},
		success: {},
		disabled: { type: Boolean }
	},
	setup(e) {
		let t = e, n = /* @__PURE__ */ z(!1), r = /* @__PURE__ */ z(""), i = /* @__PURE__ */ z(!1);
		async function a() {
			if (!n.value) {
				n.value = !0, i.value = !1, r.value = "";
				try {
					await t.action(), r.value = t.success || "";
				} catch (e) {
					i.value = !0, r.value = e.message;
				} finally {
					n.value = !1;
				}
			}
		}
		return (t, o) => (U(), W(H, null, [G("button", {
			type: "button",
			class: "sd-primary",
			disabled: e.disabled || n.value,
			onClick: a
		}, N(n.value ? "保存中…" : e.label), 9, ul), r.value ? (U(), W("span", {
			key: 0,
			role: i.value ? "alert" : "status"
		}, N(r.value), 9, dl)) : J("", !0)], 64));
	}
}), pl = {
	key: 0,
	class: "sd-card"
}, ml = {
	key: 0,
	class: "sd-card"
}, hl = { class: "sd-prose" }, gl = { class: "sd-card sd-stack" }, _l = {
	key: 0,
	class: "sd-status"
}, vl = { class: "sd-sticky sd-actions" }, yl = { class: "sd-card sd-stack" }, bl = {
	key: 0,
	role: "status"
}, xl = {
	class: "sd-alert",
	role: "alert"
}, Sl = {
	key: 2,
	class: "sd-compare"
}, Cl = { class: "sd-field" }, wl = ["value"], Tl = { key: 3 }, El = { class: "sd-actions" }, Dl = ["disabled"], Ol = ["disabled"], kl = /* @__PURE__ */ Qn({
	__name: "Growth",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = Zs(), a = X(() => Math.min(o.value, t.value.state?.settings.growthDiaryCount ?? 0)), o = X(() => t.value.state?.diaries.filter((e) => !e.needsReview && e.body.trim()).length ?? 0), s = X(() => t.value.state?.characterGrowth), c = /* @__PURE__ */ z(""), l = /* @__PURE__ */ z("");
		return Vn(() => s.value?.revision, () => c.value = s.value?.content || "", { immediate: !0 }), Vn(() => t.value.growthPreview, (e) => l.value = e?.content || "", { immediate: !0 }), (e, u) => s.value ? (U(), W(H, { key: 1 }, [
			B(t).state.legacyGrowthDraft ? (U(), W("details", ml, [u[8] ||= G("summary", null, "升级前的成长待审稿", -1), G("p", hl, N(B(t).state.legacyGrowthDraft), 1)])) : J("", !0),
			G("section", gl, [
				u[9] ||= G("header", { class: "sd-section-title" }, [G("h3", null, "当前角色画像")], -1),
				s.value.reviewRecommended ? (U(), W("p", _l, "历史材料有变更，可核对现画像或发起重整。")) : J("", !0),
				K(wc, {
					modelValue: c.value,
					"onUpdate:modelValue": u[0] ||= (e) => c.value = e,
					label: "人格、关系与当前状态",
					rows: 12
				}, null, 8, ["modelValue"]),
				G("div", vl, [K(fl, {
					action: () => B(n).mutate((e) => B(ac)(e, c.value)),
					label: "保存画像",
					success: "画像已保存"
				}, null, 8, ["action"])])
			]),
			G("section", yl, [
				u[11] ||= G("header", { class: "sd-section-title" }, [G("h3", null, "根据日记更新画像")], -1),
				B(t).growthProgress ? (U(), W("p", bl, N(B(t).growthProgress), 1)) : J("", !0),
				B(t).growthFailure ? (U(), W(H, { key: 1 }, [G("p", xl, N(B(t).growthFailure.message), 1), K(Oc, { content: B(t).growthFailure.rawResponse }, null, 8, ["content"])], 64)) : J("", !0),
				B(t).growthPreview?.changed ? (U(), W("div", Sl, [G("label", Cl, [u[10] ||= q("现画像", -1), G("textarea", {
					value: s.value.content,
					rows: "10",
					readonly: ""
				}, null, 8, wl)]), K(wc, {
					modelValue: l.value,
					"onUpdate:modelValue": u[1] ||= (e) => l.value = e,
					label: "重整后画像",
					rows: 10
				}, null, 8, ["modelValue"])])) : J("", !0),
				B(t).growthPreview ? (U(), W("p", Tl, "使用了 " + N(B(t).growthPreview.count) + " 篇日记。" + N(B(t).growthPreview.changed ? "" : "没有实质变化。"), 1)) : J("", !0),
				G("div", El, [B(t).busy.includes("growth") ? (U(), W("button", {
					key: 0,
					onClick: u[2] ||= (e) => B(n).cancel("growth")
				}, "取消重整")) : B(t).growthPreview ? (U(), W(H, { key: 1 }, [G("button", { onClick: u[3] ||= (...e) => B(n).discardGrowth && B(n).discardGrowth(...e) }, "保留现稿"), B(t).growthPreview.changed ? (U(), W("button", {
					key: 0,
					class: "sd-primary",
					onClick: u[4] ||= (e) => B(r)(() => B(n).acceptGrowth(l.value))
				}, "应用候选画像")) : J("", !0)], 64)) : B(t).channels.some((e) => e.id === B(t).state?.settings.bindings.growth) ? (U(), W(H, { key: 2 }, [G("button", {
					disabled: !a.value,
					onClick: u[5] ||= (e) => B(r)(() => B(n).generateGrowth("recent"))
				}, "追踪最新动态（" + N(a.value) + " 篇）", 9, Dl), G("button", {
					disabled: !o.value,
					onClick: u[6] ||= (e) => B(r)(() => B(n).generateGrowth("global"))
				}, "全局重建（" + N(o.value) + " 篇）", 9, Ol)], 64)) : (U(), W("button", {
					key: 3,
					onClick: u[7] ||= (e) => B(i)("settings")
				}, "配置成长渠道"))])
			])
		], 64)) : (U(), W("p", pl, N(B(t).blocker), 1));
	}
}), Al = { class: "sd-search" }, jl = ["aria-label", "placeholder"], Ml = /* @__PURE__ */ Qn({
	__name: "SearchField",
	props: /*@__PURE__*/ Nr({ label: {} }, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = $r(e, "modelValue");
		return (n, r) => (U(), W("label", Al, [r[1] ||= G("i", {
			class: "fa-solid fa-magnifying-glass",
			"aria-hidden": "true"
		}, null, -1), V(G("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			type: "search",
			"aria-label": e.label,
			placeholder: e.label
		}, null, 8, jl), [[Z, t.value]])]));
	}
}), Nl = {
	key: 0,
	class: "sd-card"
}, Pl = { class: "sd-card sd-stack" }, Fl = ["disabled"], Il = ["disabled"], Ll = { class: "sd-field" }, Rl = { class: "sd-field" }, zl = { class: "sd-field" }, Bl = { class: "sd-actions sd-sticky" }, Vl = ["disabled"], Hl = ["disabled"], Ul = { key: 0 }, Wl = { key: 1 }, Gl = { class: "sd-snippet" }, Kl = ["disabled", "onClick"], ql = {
	key: 0,
	class: "sd-card"
}, Jl = /* @__PURE__ */ Qn({
	__name: "Archive",
	props: { kind: {} },
	setup(e) {
		let t = e, { view: n, host: r, run: i } = Zs(), a = X(() => t.kind === "diaries"), o = X(() => a.value ? "日记" : "记忆点"), s = /* @__PURE__ */ z(""), c = /* @__PURE__ */ z(null), l = /* @__PURE__ */ z(!1), u = /* @__PURE__ */ z(!1), d, f = "", p = X(() => {
			let e = n.value.state;
			if (!e) return [];
			let t = a.value ? [...e.diaries].sort((e, t) => t.createdAt - e.createdAt) : e.memories, r = s.value.trim().toLowerCase();
			return t.filter((e) => e.id === c.value?.id || [
				e.title,
				e.body,
				e.content,
				e.storyTime
			].join("\n").toLowerCase().includes(r));
		}), m = X(() => l.value ? [c.value, ...p.value.filter((e) => e.id !== c.value.id)] : p.value);
		function h(e, t) {
			d = t.currentTarget, l.value = !e, f = e ? JSON.stringify(e) : "", c.value = e ? { ...e } : a.value ? gc({ title: "新日记" }) : pc();
		}
		function g() {
			c.value = null, l.value = !1, bn(() => d?.focus({ preventScroll: !0 }));
		}
		async function _() {
			let e = c.value, t = { ...e };
			if (!$(a.value ? t.body : t.content)) throw Error("请填写正文。");
			u.value = !0;
			try {
				await r.mutate((e) => {
					let n = a.value ? e.diaries : e.memories, r = n.findIndex((e) => e.id === t.id);
					if (!l.value && r < 0) throw Error("条目已删除。");
					if (r >= 0 && JSON.stringify(n[r]) !== f) throw Error("条目已变化，请重新打开核对。");
					if (a.value) {
						let n = gc({
							...t,
							needsReview: !1,
							updatedAt: Date.now()
						});
						r < 0 ? e.diaries.push(n) : e.diaries[r] = n, e.characterGrowth.reviewRecommended = !0;
					} else yc(e, t, r >= 0 ? t.id : null);
					f = JSON.stringify(n.find((e) => e.id === t.id));
				}), c.value === e && g();
			} finally {
				u.value = !1;
			}
		}
		async function v() {
			let e = c.value.id;
			await r.mutate((t) => {
				let n = t.memories.find((t) => t.id === e);
				if (!n || JSON.stringify(n) !== f) throw Error("条目已变化，请重新打开核对。");
				n.locked = !n.locked, f = JSON.stringify(n);
			}), c.value.locked = n.value.state.memories.find((t) => t.id === e).locked;
		}
		function y() {
			if (window.confirm("删除此" + o.value + "？")) return i(async () => {
				let e = c.value.id;
				await r.mutate((t) => {
					if (a.value) t.diaries = t.diaries.filter((t) => t.id !== e), t.characterGrowth.reviewRecommended = !0;
					else {
						if (t.memories.find((t) => t.id === e)?.locked) throw Error("请先解锁。");
						t.memories = t.memories.filter((t) => t.id !== e), t.memoryRevision++;
					}
				}), g();
			});
		}
		return (e, t) => B(n).state ? (U(), W(H, { key: 1 }, [
			G("section", Pl, [K(Ml, {
				modelValue: s.value,
				"onUpdate:modelValue": t[0] ||= (e) => s.value = e,
				label: "搜索" + o.value
			}, null, 8, ["modelValue", "label"]), G("div", null, [G("button", {
				disabled: u.value,
				onClick: t[1] ||= (e) => h(null, e)
			}, "新建" + N(o.value), 9, Fl)])]),
			(U(!0), W(H, null, Dr(m.value, (e) => (U(), W("article", {
				key: e.id,
				class: "sd-card sd-stack"
			}, [c.value?.id === e.id ? (U(), W(H, { key: 0 }, [
				G("h3", null, "编辑" + N(o.value), 1),
				G("fieldset", {
					class: "sd-stack",
					disabled: c.value.locked || u.value
				}, [G("label", Ll, [t[9] ||= q("标题", -1), V(G("input", { "onUpdate:modelValue": t[2] ||= (e) => c.value.title = e }, null, 512), [[Z, c.value.title]])]), a.value ? (U(), ea(wc, {
					key: 0,
					modelValue: c.value.body,
					"onUpdate:modelValue": t[3] ||= (e) => c.value.body = e,
					label: "日记正文",
					rows: 12
				}, null, 8, ["modelValue"])) : (U(), W(H, { key: 1 }, [
					K(wc, {
						modelValue: c.value.content,
						"onUpdate:modelValue": t[4] ||= (e) => c.value.content = e,
						label: "内容"
					}, null, 8, ["modelValue"]),
					G("label", Rl, [t[10] ||= q("故事时间", -1), V(G("input", { "onUpdate:modelValue": t[5] ||= (e) => c.value.storyTime = e }, null, 512), [[Z, c.value.storyTime]])]),
					G("label", zl, [t[11] ||= q("重要度", -1), V(G("input", {
						type: "number",
						"onUpdate:modelValue": t[6] ||= (e) => c.value.importance = e,
						min: "1",
						max: "5"
					}, null, 512), [[
						Z,
						c.value.importance,
						void 0,
						{ number: !0 }
					]])]),
					G("label", null, [V(G("input", {
						type: "checkbox",
						"onUpdate:modelValue": t[7] ||= (e) => c.value.permanent = e
					}, null, 512), [[ko, c.value.permanent]]), t[12] ||= q(" 常驻", -1)])
				], 64))], 8, Il),
				G("div", Bl, [
					!l.value && !a.value ? (U(), W("button", {
						key: 0,
						disabled: u.value,
						onClick: t[8] ||= (e) => B(i)(v)
					}, N(c.value.locked ? "解锁" : "锁定"), 9, Vl)) : J("", !0),
					!l.value && !c.value.locked ? (U(), W("button", {
						key: 1,
						class: "sd-danger",
						disabled: u.value,
						onClick: y
					}, "删除", 8, Hl)) : J("", !0),
					K(fl, {
						action: _,
						label: "保存" + o.value,
						disabled: c.value.locked
					}, null, 8, ["label", "disabled"])
				])
			], 64)) : (U(), W(H, { key: 1 }, [
				G("h3", null, N(e.title), 1),
				a.value ? (U(), W("p", Ul, N(new Date(e.createdAt).toLocaleDateString()) + " " + N(e.needsReview ? "· 待复核" : ""), 1)) : (U(), W("p", Wl, "重要度 " + N(e.importance) + " " + N(e.storyTime) + " " + N(e.permanent ? "· 常驻" : "") + " " + N(e.locked ? "· 已锁定" : ""), 1)),
				G("p", Gl, N(a.value ? e.body : e.content), 1)
			], 64)), V(G("div", null, [G("button", {
				disabled: u.value,
				onClick: (t) => h(e, t)
			}, "查看与编辑", 8, Kl)], 512), [[qa, c.value?.id !== e.id]])]))), 128)),
			m.value.length ? J("", !0) : (U(), W("p", ql, "没有符合条件的" + N(o.value) + "。", 1))
		], 64)) : (U(), W("p", Nl, N(B(n).blocker), 1));
	}
}), Yl = /* @__PURE__ */ Qn({
	__name: "Diaries",
	setup(e) {
		return (e, t) => (U(), ea(Jl, { kind: "diaries" }));
	}
}), Xl = /* @__PURE__ */ Qn({
	__name: "Memory",
	setup(e) {
		return (e, t) => (U(), ea(Jl, { kind: "memory" }));
	}
}), Zl = {
	diary: "{\"title\":\"标题\",\"body\":\"日记正文\"}",
	memory: "{\"memories\":[{\"title\":\"标题\",\"content\":\"记忆内容\",\"storyTime\":null,\"importance\":3}]}，importance 是 1–5 的整数；storyTime 是字符串或 null；没有记忆点时返回 {\"memories\":[]}。",
	growth: "{\"changed\":true,\"content\":\"完整候选画像\"} 或 {\"changed\":false,\"content\":\"\"}",
	test: "{\"ok\":true}"
};
function Ql(e, t, n, r, i, a = "recent") {
	let o = t.prompts[e], s = "sd_" + e, c = e === "growth" && a === "global", l = [n.context];
	!c && r && l.push("[当前角色画像]\n" + r);
	let u = c ? o.globalDescription ?? "根据角色设定和全部有效日记重建 {{char}} 的完整当前画像。以日记中有依据的人格、关系与生活状态为准，结合前后变化整理至最新状态。素材足以建立画像时，返回完整候选画像。" : o.description;
	return {
		system: Es(o.system, n),
		background: l.filter(Boolean).join("\n\n"),
		description: Es(u, n),
		material: i,
		format: "返回一个用 <" + s + "> 和 </" + s + "> 包裹的 JSON 对象。结构如下：\n" + Zl[e]
	};
}
function $l(e) {
	let { system: t, background: n, description: r, material: i, format: a } = e;
	return [{
		role: "system",
		content: t
	}, {
		role: "user",
		content: [
			"[背景参考]\n" + n,
			"[任务描述]\n" + r,
			"[内容素材]\n" + i,
			"[格式规定]\n" + a
		].join("\n\n")
	}];
}
var eu = class extends Error {
	constructor(e, t) {
		super(e), this.rawResponse = t;
	}
};
function tu(e, t) {
	let n = [...t.matchAll(RegExp("<sd_" + e + ">([\\s\\S]*?)</sd_" + e + ">", "g"))];
	if (n.length !== 1) throw new eu("需要一个完整的任务结果标签块，可重试本项。", t);
	let r;
	try {
		r = JSON.parse(n[0][1]);
	} catch {
		throw new eu("标签内 JSON 无法解析，可重试本项。", t);
	}
	if (!{
		diary: () => $(r?.title) && $(r?.body),
		memory: () => Array.isArray(r?.memories) && r.memories.every((e) => hc(e) && (e.storyTime === null || typeof e.storyTime == "string")),
		growth: () => typeof r?.changed == "boolean" && (r.changed ? !!$(r.content) : r.content === ""),
		test: () => r?.ok === !0
	}[e]()) throw new eu("结果字段与格式规定不符，可重试本项。", t);
	return r;
}
function nu(e, t) {
	let n = e.diaries.filter((e) => !e.needsReview && $(e.body)).sort((e, t) => t.createdAt - e.createdAt);
	return (t === "global" ? n : n.slice(0, e.settings.growthDiaryCount)).reverse();
}
function ru(e, t, n) {
	let r = ws(e, t, n.char, n.user);
	if (r.errors.length) throw Error("正文或故事时间标签未匹配：" + r.errors.map((e) => "楼层 " + (e.index + 1)).join("、"));
	return r.text;
}
function iu(e, t, n, r = [], i = "recent") {
	let a = e === "growth" ? nu(t, i).map((e) => e.title + "\n" + e.body).join("\n\n") : ru(r, t.settings.extraction, n);
	return Ql(e, t.settings, n, t.characterGrowth.content, a, i);
}
async function au(e, t, n, r, i) {
	let a = await i(e, $l(iu(e, t, n.character, r)));
	return e === "diary" ? {
		title: a.title,
		body: a.body
	} : a.memories.map(({ title: e, content: t, storyTime: n, importance: r }) => ({
		id: $o("proposal"),
		accepted: !0,
		value: pc({
			title: e,
			content: t,
			storyTime: n,
			importance: r
		})
	}));
}
function ou(e, t) {
	for (let n of t.filter((e) => e.accepted)) yc(e, {
		...n.value,
		id: $o("fact"),
		locked: !1
	});
}
// redact.js
function su(e, t = []) {
	let n = String(e ?? "");
	for (let e of t.filter((e) => typeof e == "string" && e.length)) n = n.split(e).join("[已隐藏]");
	return n.replace(/https?:\/\/[^\s"'<>]+/gi, "[地址已隐藏]").replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[已隐藏]").replace(/\bBearer\s+[^\s,"'}]+/gi, "Bearer [已隐藏]").replace(/((?:api[_-]?key|authorization|proxy_password|password|secret|token)\s*["']?\s*[:=]\s*)["']?[^\s,"'}]+/gi, "$1[已隐藏]").slice(0, 600);
}
// channels.js
var cu = "scene_diary_channels", lu = "/api/backends/chat-completions/", uu = () => ({
	id: $o("channel"),
	name: "",
	url: "",
	key: "",
	model: "",
	temperature: .4,
	maxTokens: 4096
});
function du(e) {
	return e.extensionSettings?.[cu] || [];
}
function fu(e, t) {
	e.extensionSettings[cu] = t, e.saveSettingsDebounced();
}
function pu(e) {
	let t = new URL(e);
	if (!["http:", "https:"].includes(t.protocol) || t.username || t.password || t.search || t.hash) throw Error("请输入不含认证信息的 HTTP(S) API 地址。");
	let n = t.pathname.replace(/\/+$/, "").replace(/\/(?:chat\/completions|models)$/, "");
	return n ||= "/v1", t.origin + n;
}
function mu(e) {
	let t = pu(e.url);
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
async function hu(e, t, n, r, i) {
	let a = t.key ? { Authorization: "Bearer " + t.key } : {}, o = {
		chat_completion_source: "custom",
		custom_api_format: "openai_compat",
		custom_url: pu(t.url),
		custom_include_headers: JSON.stringify(a),
		...r
	};
	try {
		let r = await fetch(lu + n, {
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
			throw Object.assign(Error(su(e.message || (typeof e == "string" ? e : "HTTP " + r.status), [t.key])), {
				bridgeStatus: r.status,
				providerStatus: e.status || e.status_code,
				providerCode: su(e.code || "", [t.key]),
				param: e.param
			});
		}
		if (String(s?.id || "").startsWith("tauritavern-error-")) throw Error("TauriTavern 代理未返回有效补全，请检查渠道或更新宿主。");
		return s;
	} catch (e) {
		throw i?.throwIfAborted(), e.message = su(e.message, [t.key]), e;
	}
}
async function gu(e, t, n) {
	let r = await hu(e, t, "status", {}, n), i = r?.data ?? r?.models;
	if (!Array.isArray(i)) throw Error("代理未返回模型列表，可手动填写模型。");
	return [...new Set(i.map((e) => typeof e == "string" ? e : e?.id).filter((e) => typeof e == "string" && e.trim()))].sort();
}
async function _u(e, t, n, r, i) {
	let a = (await hu(e, t, "generate", {
		model: t.model,
		messages: r,
		stream: !1,
		type: "quiet",
		max_tokens: t.maxTokens,
		temperature: t.temperature
	}, i))?.choices?.[0];
	if (a?.message?.refusal || a?.finish_reason === "content_filter") throw Error("模型拒绝生成该内容。");
	let o = a?.message?.content;
	if (a?.finish_reason === "length") throw new eu("模型输出被截断，请调整渠道最大输出 token 后重试。", o);
	if (typeof o != "string") throw Error("渠道未返回文本。");
	return tu(n, o);
}
function vu(e, t, n) {
	let r = Ql("test", { prompts: { test: {
		system: "渠道连通性测试。",
		description: "按规定格式确认连接。"
	} } }, {}, "", "");
	return _u(e, mu(t), "test", $l(r), n);
}
// src/pages/Settings.vue?vue&type=script&setup=true&lang.ts
var yu = { class: "sd-card sd-stack" }, bu = { class: "sd-section-title" }, xu = ["disabled"], Su = ["disabled", "onClick"], Cu = { class: "sd-form-grid" }, wu = { class: "sd-field" }, Tu = { class: "sd-field" }, Eu = { class: "sd-field" }, Du = { class: "sd-field" }, Ou = { class: "sd-field" }, ku = { class: "sd-field" }, Au = {
	key: 0,
	role: "status"
}, ju = {
	key: 1,
	class: "sd-subcard sd-stack"
}, Mu = { class: "sd-field" }, Nu = { class: "sd-model-list" }, Pu = ["aria-pressed", "onClick"], Fu = { key: 0 }, Iu = { class: "sd-actions" }, Lu = ["disabled"], Ru = ["disabled"], zu = ["disabled"], Bu = {
	key: 0,
	class: "sd-card"
}, Vu = { class: "sd-card sd-stack" }, Hu = { class: "sd-form-grid" }, Uu = ["onUpdate:modelValue"], Wu = ["value"], Gu = {
	class: "sd-card",
	open: ""
}, Ku = { class: "sd-stack" }, qu = { class: "sd-form-grid" }, Ju = { class: "sd-field" }, Yu = { class: "sd-field" }, Xu = { class: "sd-field" }, Zu = { class: "sd-field" }, Qu = { class: "sd-field" }, $u = { class: "sd-field" }, ed = { class: "sd-card" }, td = { class: "sd-stack" }, nd = { class: "sd-form-grid" }, rd = { class: "sd-field" }, id = { class: "sd-field" }, ad = { class: "sd-field" }, od = { class: "sd-field" }, sd = { class: "sd-form-grid" }, cd = { class: "sd-field" }, ld = { class: "sd-field" }, ud = { class: "sd-field" }, dd = { class: "sd-card" }, fd = { class: "sd-stack" }, pd = ["onUpdate:modelValue"], md = { class: "sd-stack" }, hd = { class: "sd-segments" }, gd = ["aria-pressed", "onClick"], _d = {
	key: 0,
	class: "sd-field"
}, vd = { class: "sd-prose" }, yd = { class: "sd-prose" }, bd = { class: "sd-prose" }, xd = { class: "sd-actions sd-sticky" }, Sd = /* @__PURE__ */ Qn({
	__name: "Settings",
	setup(e) {
		let { view: t, host: n, run: r, notice: i, select: a } = Zs(), o = /* @__PURE__ */ z(null), s = /* @__PURE__ */ z(null), c = /* @__PURE__ */ z([]), l = /* @__PURE__ */ z("diary"), u = /* @__PURE__ */ z("recent"), d = /* @__PURE__ */ z(!1), f = /* @__PURE__ */ z(!1), p = /* @__PURE__ */ z(null), m = /* @__PURE__ */ z(""), h = X(() => {
			let e = fs(t.value.state);
			return e ? JSON.stringify([
				e.id,
				e.messageIds,
				t.value.dialogueRevision
			]) : "";
		}), g = X(() => d.value && f.value && l.value !== "growth"), _ = /* @__PURE__ */ z(!1), v = /* @__PURE__ */ z(""), y = /* @__PURE__ */ z(""), b = X(() => c.value.filter((e) => e.toLowerCase().includes(v.value.toLowerCase())));
		Vn([g, h], async ([e, t], r, i) => {
			if (!e || !t || p.value?.source === t) return;
			let a = !0;
			i(() => {
				a = !1;
			}), m.value = "";
			try {
				let e = await n.readPreviewDialogue();
				a && (p.value = {
					source: t,
					messages: e
				});
			} catch (e) {
				a && (m.value = e.message);
			}
		});
		let x = X(() => {
			let e = t.value.state;
			if (!e || !o.value || !d.value) return null;
			let r = n.previewCharacter(l.value);
			return l.value === "growth" ? iu("growth", {
				...e,
				settings: o.value
			}, r, [], u.value) : Ql(l.value, o.value, r, e.characterGrowth.content, "");
		}), S = X(() => {
			if (!d.value || !f.value) return "";
			if (l.value === "growth") return x.value?.material;
			if (!h.value) return "";
			if (m.value) return m.value;
			if (p.value?.source !== h.value) return "正在读取本幕对话…";
			try {
				return ru(p.value.messages, ie(), n.previewCharacter(l.value));
			} catch (e) {
				return e.message;
			}
		}), C = /* @__PURE__ */ z(), w = /* @__PURE__ */ z(!1), T = null;
		gr(() => T?.abort());
		let ee = n.getContext, te = () => ee().accountStorage, E = /* @__PURE__ */ z(te()?.getItem("scene_diary_embedding_key") || ""), D = /* @__PURE__ */ z(te()?.getItem("scene_diary_rerank_key") || ""), ne = X(() => JSON.stringify(t.value.state?.settings || null)), O = /* @__PURE__ */ z({});
		Vn(ne, (e) => {
			let t = JSON.parse(e);
			if (o.value = t && fc(t), !o.value) return;
			let n = {};
			for (let e of ["user", "character"]) {
				n[e] = {};
				for (let t of ["bodyTagPairs", "storyTimeTagPairs"]) n[e][t] = o.value.extraction[e][t].map((e) => e.open + " " + e.close).join("\n");
			}
			O.value = n;
		}, { immediate: !0 });
		function k(e = uu()) {
			s.value = { ...e }, c.value = [], _.value = !1, y.value = "", v.value = "";
		}
		function A() {
			return r(() => {
				let e = mu(s.value);
				fu(ee(), [...t.value.channels.filter((t) => t.id !== e.id), e]), n.refresh(), s.value = null, i.value = "渠道已提交保存。";
			});
		}
		function j() {
			if (s.value && window.confirm("删除该渠道？已绑定的任务需要重新选择。")) return r(() => {
				fu(ee(), t.value.channels.filter((e) => e.id !== s.value.id)), n.refresh(), s.value = null;
			});
		}
		async function M(e) {
			let t = T = new AbortController();
			w.value = !0;
			let n = { ...s.value };
			try {
				if (y.value = "", _.value = !1, e === "models") c.value = await gu(ee(), n, t.signal), v.value = "", _.value = c.value.length > 0, y.value = _.value ? "返回 " + c.value.length + " 个模型。" : "渠道未提供模型，可手动填写。";
				else {
					if ((await vu(ee(), n, t.signal)).ok !== !0) throw Error("渠道返回了意外的测试结果。");
					y.value = "渠道测试通过。";
				}
			} catch (e) {
				y.value = t.signal.aborted ? "请求已取消。" : e.message;
			} finally {
				T = null, w.value = !1;
			}
		}
		function re(e) {
			return e.split(/\r?\n/).map((e) => e.trim()).filter(Boolean).map((e) => {
				let [t, n] = e.split(/\s+/), r = as({
					open: t,
					close: n
				});
				if (!r) throw Error("标签对无效。每行填写一对同名开始和结束标签。");
				return r;
			});
		}
		function ie() {
			return Object.fromEntries(["user", "character"].map((e) => [e, {
				requiredStoryTime: o.value.extraction[e].requiredStoryTime,
				bodyTagPairs: re(O.value[e].bodyTagPairs),
				storyTimeTagPairs: re(O.value[e].storyTimeTagPairs)
			}]));
		}
		async function ae() {
			if (!C.value?.reportValidity()) throw Error("请检查设置中的数值。");
			let e = JSON.parse(JSON.stringify(o.value));
			if (e.extraction = ie(), e.semantic.enabled && (e.semantic.endpoint = Hs(e.semantic.endpoint), !e.semantic.model.trim())) throw Error("请填写 Embedding 模型。");
			if (e.semantic.rerank && (e.semantic.rerankEndpoint = Hs(e.semantic.rerankEndpoint, "重排"), !e.semantic.rerankModel.trim())) throw Error("请填写重排模型。");
			let r = Object.fromEntries(Object.entries(e.bindings).filter(([, e]) => t.value.channels.some((t) => t.id === e))), i = te();
			for (let [e, t] of [["scene_diary_embedding_key", E.value], ["scene_diary_rerank_key", D.value]]) t.trim() ? i?.setItem(e, t.trim()) : i?.removeItem(e);
			await n.mutate((t) => {
				t.settings = fc({
					...e,
					bindings: r
				}), Object.keys(oc).every((e) => t.settings.bindings[e]) && (t.connectionSetupNeeded = !1);
			});
		}
		return (e, n) => (U(), W(H, null, [G("section", yu, [
			G("header", bu, [n[37] ||= G("h3", null, "API 渠道", -1), G("button", {
				class: "sd-primary",
				disabled: w.value,
				onClick: n[0] ||= (e) => k()
			}, "新增渠道", 8, xu)]),
			n[45] ||= G("p", null, "渠道在当前酒馆账户内共用，任务分派按聊天保存。", -1),
			(U(!0), W(H, null, Dr(B(t).channels, (e) => (U(), W("div", {
				class: "sd-listrow",
				key: e.id
			}, [G("div", null, [G("strong", null, N(e.name), 1), G("p", null, N(e.model), 1)]), G("button", {
				disabled: w.value,
				onClick: (t) => k(e)
			}, "编辑", 8, Su)]))), 128)),
			s.value ? (U(), W("form", {
				key: 0,
				class: "sd-subcard sd-stack",
				onSubmit: Ro(A, ["prevent"])
			}, [
				G("div", Cu, [
					G("label", wu, [n[38] ||= q("名称", -1), V(G("input", {
						"onUpdate:modelValue": n[1] ||= (e) => s.value.name = e,
						autocomplete: "off",
						required: ""
					}, null, 512), [[Z, s.value.name]])]),
					G("label", Tu, [n[39] ||= q("OpenAI 兼容 API 地址", -1), V(G("input", {
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
					G("label", Eu, [n[40] ||= q("API Key", -1), V(G("input", {
						"onUpdate:modelValue": n[3] ||= (e) => s.value.key = e,
						type: "password",
						autocomplete: "new-password"
					}, null, 512), [[Z, s.value.key]])]),
					G("label", Du, [n[41] ||= q("模型", -1), V(G("input", {
						"onUpdate:modelValue": n[4] ||= (e) => s.value.model = e,
						required: ""
					}, null, 512), [[Z, s.value.model]])]),
					G("label", Ou, [n[42] ||= q("温度", -1), V(G("input", {
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
					G("label", ku, [n[43] ||= q("最大输出 token", -1), V(G("input", {
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
				]),
				y.value ? (U(), W("p", Au, N(y.value), 1)) : J("", !0),
				_.value ? (U(), W("section", ju, [
					G("label", Mu, [n[44] ||= q("搜索模型", -1), V(G("input", {
						"onUpdate:modelValue": n[7] ||= (e) => v.value = e,
						type: "search"
					}, null, 512), [[Z, v.value]])]),
					G("div", Nu, [(U(!0), W(H, null, Dr(b.value, (e) => (U(), W("button", {
						type: "button",
						key: e,
						"aria-pressed": e === s.value.model,
						onClick: (t) => {
							s.value.model = e, _.value = !1, y.value = "已选择 " + e;
						}
					}, N(e) + " " + N(e === s.value.model ? "✓" : ""), 9, Pu))), 128))]),
					b.value.length ? J("", !0) : (U(), W("p", Fu, "没有匹配的模型。")),
					G("button", {
						type: "button",
						onClick: n[8] ||= (e) => _.value = !1
					}, "收起列表")
				])) : J("", !0),
				G("div", Iu, [
					w.value ? (U(), W("button", {
						key: 0,
						type: "button",
						onClick: n[9] ||= (e) => B(T)?.abort()
					}, "取消请求")) : (U(), W(H, { key: 1 }, [G("button", {
						type: "button",
						onClick: n[10] ||= (e) => M("models")
					}, "获取模型列表"), G("button", {
						type: "button",
						onClick: n[11] ||= (e) => M("test")
					}, "测试渠道")], 64)),
					G("button", {
						type: "button",
						disabled: w.value,
						onClick: n[12] ||= (e) => s.value = null
					}, "关闭", 8, Lu),
					B(t).channels.some((e) => e.id === s.value.id) ? (U(), W("button", {
						key: 2,
						type: "button",
						class: "sd-danger",
						disabled: w.value,
						onClick: j
					}, "删除", 8, Ru)) : J("", !0),
					G("button", {
						class: "sd-primary",
						disabled: w.value
					}, "保存渠道", 8, zu)
				])
			], 32)) : J("", !0)
		]), o.value ? (U(), W("form", {
			key: 1,
			ref_key: "settingsForm",
			ref: C,
			class: "sd-stack",
			onSubmit: n[36] ||= Ro(() => {}, ["prevent"])
		}, [
			G("section", Vu, [n[47] ||= G("h3", null, "任务分派", -1), G("div", Hu, [(U(!0), W(H, null, Dr(B(oc), (e, r) => (U(), W("label", {
				key: r,
				class: "sd-field"
			}, [q(N(e) + " ", 1), V(G("select", { "onUpdate:modelValue": (e) => o.value.bindings[r] = e }, [n[46] ||= G("option", { value: void 0 }, "请选择渠道", -1), (U(!0), W(H, null, Dr(B(t).channels, (e) => (U(), W("option", {
				key: e.id,
				value: e.id
			}, N(e.name), 9, Wu))), 128))], 8, Uu), [[jo, o.value.bindings[r]]])]))), 128))])]),
			G("details", Gu, [n[55] ||= G("summary", null, "上下文与召回", -1), G("div", Ku, [G("label", null, [V(G("input", {
				type: "checkbox",
				"onUpdate:modelValue": n[13] ||= (e) => o.value.growthEnabled = e
			}, null, 512), [[ko, o.value.growthEnabled]]), n[48] ||= q(" 注入当前画像", -1)]), G("div", qu, [
				G("label", Ju, [n[49] ||= q("近期日记篇数", -1), V(G("input", {
					"onUpdate:modelValue": n[14] ||= (e) => o.value.recentDiaryCount = e,
					type: "number",
					min: "0",
					required: ""
				}, null, 512), [[
					Z,
					o.value.recentDiaryCount,
					void 0,
					{ number: !0 }
				]])]),
				G("label", Yu, [n[50] ||= q("成长追踪日记篇数", -1), V(G("input", {
					"onUpdate:modelValue": n[15] ||= (e) => o.value.growthDiaryCount = e,
					type: "number",
					min: "0",
					required: ""
				}, null, 512), [[
					Z,
					o.value.growthDiaryCount,
					void 0,
					{ number: !0 }
				]])]),
				G("label", Xu, [n[51] ||= q("查询深度 d", -1), V(G("input", {
					"onUpdate:modelValue": n[16] ||= (e) => o.value.queryDepth = e,
					type: "number",
					min: "0",
					required: ""
				}, null, 512), [[
					Z,
					o.value.queryDepth,
					void 0,
					{ number: !0 }
				]])]),
				G("label", Zu, [n[52] ||= q("初检数量 q", -1), V(G("input", {
					"onUpdate:modelValue": n[17] ||= (e) => o.value.retrievalCount = e,
					type: "number",
					min: "0",
					required: ""
				}, null, 512), [[
					Z,
					o.value.retrievalCount,
					void 0,
					{ number: !0 }
				]])]),
				G("label", Qu, [n[53] ||= q("精排候选数 r", -1), V(G("input", {
					"onUpdate:modelValue": n[18] ||= (e) => o.value.candidateCount = e,
					type: "number",
					min: "0",
					required: ""
				}, null, 512), [[
					Z,
					o.value.candidateCount,
					void 0,
					{ number: !0 }
				]])]),
				G("label", $u, [n[54] ||= q("召回分数门槛", -1), V(G("input", {
					"onUpdate:modelValue": n[19] ||= (e) => o.value.recallScoreThreshold = e,
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
				]])])
			])])]),
			G("details", ed, [n[65] ||= G("summary", null, "Embedding 与重排", -1), G("div", td, [
				G("label", null, [V(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[20] ||= (e) => o.value.semantic.enabled = e
				}, null, 512), [[ko, o.value.semantic.enabled]]), n[56] ||= q(" 使用向量检索", -1)]),
				G("div", nd, [
					G("label", rd, [n[57] ||= q("Embedding 完整地址", -1), V(G("input", {
						"onUpdate:modelValue": n[21] ||= (e) => o.value.semantic.endpoint = e,
						type: "url",
						placeholder: "https://example.com/v1/embeddings"
					}, null, 512), [[
						Z,
						o.value.semantic.endpoint,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", id, [n[58] ||= q("Embedding 模型", -1), V(G("input", { "onUpdate:modelValue": n[22] ||= (e) => o.value.semantic.model = e }, null, 512), [[
						Z,
						o.value.semantic.model,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", ad, [n[59] ||= q("Embedding 密钥", -1), V(G("input", {
						"onUpdate:modelValue": n[23] ||= (e) => E.value = e,
						type: "password",
						autocomplete: "new-password"
					}, null, 512), [[Z, E.value]])]),
					G("label", od, [n[60] ||= q("向量维度（可选）", -1), V(G("input", {
						"onUpdate:modelValue": n[24] ||= (e) => o.value.semantic.dimensions = e,
						type: "number",
						min: "1"
					}, null, 512), [[
						Z,
						o.value.semantic.dimensions,
						void 0,
						{ number: !0 }
					]])])
				]),
				G("label", null, [V(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[25] ||= (e) => o.value.semantic.rerank = e
				}, null, 512), [[ko, o.value.semantic.rerank]]), n[61] ||= q(" 使用 rerank 重排", -1)]),
				G("div", sd, [
					G("label", cd, [n[62] ||= q("Rerank 完整地址", -1), V(G("input", {
						"onUpdate:modelValue": n[26] ||= (e) => o.value.semantic.rerankEndpoint = e,
						type: "url",
						placeholder: "https://example.com/v1/rerank"
					}, null, 512), [[
						Z,
						o.value.semantic.rerankEndpoint,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", ld, [n[63] ||= q("Rerank 模型", -1), V(G("input", { "onUpdate:modelValue": n[27] ||= (e) => o.value.semantic.rerankModel = e }, null, 512), [[
						Z,
						o.value.semantic.rerankModel,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", ud, [n[64] ||= q("Rerank 密钥", -1), V(G("input", {
						"onUpdate:modelValue": n[28] ||= (e) => D.value = e,
						type: "password",
						autocomplete: "new-password"
					}, null, 512), [[Z, D.value]])])
				])
			])]),
			G("details", dd, [n[68] ||= G("summary", null, "正文和故事时间标签", -1), G("div", fd, [n[67] ||= G("p", null, "每行填写一对开始和结束标签，中间用空格分隔。正文标签留空时使用完整消息。", -1), (U(), W(H, null, Dr(["user", "character"], (e) => G("div", {
				key: e,
				class: "sd-stack"
			}, [
				G("h3", null, N(e === "user" ? "玩家" : "角色"), 1),
				K(wc, {
					modelValue: O.value[e].bodyTagPairs,
					"onUpdate:modelValue": (t) => O.value[e].bodyTagPairs = t,
					label: "正文标签",
					rows: 2
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				K(wc, {
					modelValue: O.value[e].storyTimeTagPairs,
					"onUpdate:modelValue": (t) => O.value[e].storyTimeTagPairs = t,
					label: "故事时间标签",
					rows: 2
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				G("label", null, [V(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": (t) => o.value.extraction[e].requiredStoryTime = t
				}, null, 8, pd), [[ko, o.value.extraction[e].requiredStoryTime]]), n[66] ||= q(" 故事时间必填", -1)])
			])), 64))])]),
			G("details", {
				class: "sd-card",
				onToggle: n[34] ||= (e) => d.value = e.target.open
			}, [n[74] ||= G("summary", null, "任务提示词", -1), G("div", md, [
				G("nav", hd, [(U(!0), W(H, null, Dr(B(oc), (e, t) => (U(), W("button", {
					type: "button",
					key: t,
					"aria-pressed": l.value === t,
					onClick: (e) => l.value = t
				}, N(e), 9, gd))), 128))]),
				l.value === "growth" ? (U(), W("label", _d, [n[70] ||= q("成长模式 ", -1), V(G("select", { "onUpdate:modelValue": n[29] ||= (e) => u.value = e }, [...n[69] ||= [G("option", { value: "recent" }, "追踪最新动态", -1), G("option", { value: "global" }, "全局重建", -1)]], 512), [[jo, u.value]])])) : J("", !0),
				K(wc, {
					modelValue: o.value.prompts[l.value].system,
					"onUpdate:modelValue": n[30] ||= (e) => o.value.prompts[l.value].system = e,
					label: "系统提示词"
				}, null, 8, ["modelValue"]),
				G("details", null, [n[71] ||= G("summary", null, "背景参考", -1), G("p", vd, N(x.value?.background || "暂无背景"), 1)]),
				l.value === "growth" && u.value === "global" ? (U(), ea(wc, {
					key: 1,
					modelValue: o.value.prompts.growth.globalDescription,
					"onUpdate:modelValue": n[31] ||= (e) => o.value.prompts.growth.globalDescription = e,
					label: "任务描述"
				}, null, 8, ["modelValue"])) : (U(), ea(wc, {
					key: 2,
					modelValue: o.value.prompts[l.value].description,
					"onUpdate:modelValue": n[32] ||= (e) => o.value.prompts[l.value].description = e,
					label: "任务描述"
				}, null, 8, ["modelValue"])),
				G("details", { onToggle: n[33] ||= (e) => f.value = e.target.open }, [n[72] ||= G("summary", null, "内容素材", -1), G("p", yd, N(S.value || "暂无素材"), 1)], 32),
				G("details", null, [n[73] ||= G("summary", null, "格式规定", -1), G("p", bd, N(x.value?.format), 1)])
			])], 32),
			G("div", xd, [G("button", {
				type: "button",
				onClick: n[35] ||= (e) => B(a)("diagnostics")
			}, "查看诊断"), K(fl, {
				action: ae,
				label: "保存聊天设置",
				success: "聊天设置已保存"
			})])
		], 544)) : (U(), W("p", Bu, N(B(t).blocker), 1))], 64));
	}
}), Cd = { class: "sd-card sd-stack" }, wd = { class: "sd-section-title" }, Td = { key: 0 }, Ed = {
	key: 0,
	class: "sd-log"
}, Dd = { key: 0 }, Od = { key: 0 }, kd = /* @__PURE__ */ Qn({
	__name: "Diagnostics",
	setup(e) {
		let { view: t, host: n } = Zs();
		return (e, r) => (U(), W("section", Cd, [
			G("header", wd, [r[1] ||= G("h3", null, "运行诊断", -1), G("button", { onClick: r[0] ||= (...e) => B(n).cancelRecall && B(n).cancelRecall(...e) }, "取消当前召回")]),
			B(t).trace.length ? J("", !0) : (U(), W("p", Td, "暂无任务或召回记录。")),
			(U(!0), W(H, null, Dr(B(t).trace, (e, t) => (U(), W(H, { key: t }, [e.details?.length ? (U(), W("details", Ed, [G("summary", null, [q(N(e.stage) + " · " + N(e.title) + " ", 1), e.ms == null ? J("", !0) : (U(), W("small", Dd, N(Math.round(e.ms)) + " ms", 1))]), G("ul", null, [(U(!0), W(H, null, Dr(e.details, (e, t) => (U(), W("li", { key: t }, N(e), 1))), 128))])])) : (U(), W("p", {
				key: 1,
				class: fe(["sd-log", { "sd-alert": e.status === "error" || e.status === "warning" }])
			}, [q(N(e.stage) + " · " + N(e.title) + " ", 1), e.ms == null ? J("", !0) : (U(), W("small", Od, N(Math.round(e.ms)) + " ms", 1))], 2))], 64))), 128))
		]));
	}
}), Ad = {
	class: "sd-window",
	"data-tt-mobile-surface": "fullscreen-window",
	role: "dialog",
	"aria-modal": "true",
	"aria-labelledby": "sd-title"
}, jd = { class: "sd-header" }, Md = { class: "sd-heading" }, Nd = {
	id: "sd-title",
	tabindex: "-1"
}, Pd = { class: "sd-actions" }, Fd = ["aria-pressed"], Id = ["aria-pressed"], Ld = {
	class: "sd-tabs",
	"aria-label": "剧幕工作台导航"
}, Rd = ["aria-current", "onClick"], zd = { class: "sd-body" }, Bd = {
	key: 0,
	class: "sd-alert",
	role: "alert"
}, Vd = { class: "sd-actions" }, Hd = {
	key: 1,
	class: "sd-alert",
	role: "alert"
}, Ud = {
	key: 2,
	class: "sd-status",
	role: "status"
}, Wd = { class: "sd-status" }, Gd = {
	key: 0,
	class: "sd-card sd-stack"
}, Kd = { class: "sd-prose" }, qd = { class: "sd-prose" }, Jd = { class: "sd-prose" }, Yd = {
	key: 4,
	class: "sd-card"
}, Xd = {
	class: "sd-footer",
	"aria-live": "polite"
}, Zd = { key: 0 }, Qd = { key: 1 }, $d = { key: 2 }, ef = { key: 3 }, tf = /* @__PURE__ */ Qn({
	__name: "App",
	setup(e) {
		let { view: t, host: n, opened: r, page: i, error: a, notice: o, run: s, select: c } = Zs(), l = [
			{
				id: "workbench",
				label: "剧幕工作台",
				icon: "fa-clapperboard",
				component: ll
			},
			{
				id: "growth",
				label: "角色成长",
				icon: "fa-seedling",
				component: kl
			},
			{
				id: "diaries",
				label: "日记档案",
				icon: "fa-book-open",
				component: Yl
			},
			{
				id: "memory",
				label: "长期记忆",
				icon: "fa-bookmark",
				component: Xl
			}
		], u = {
			...Object.fromEntries(l.map((e) => [e.id, e.component])),
			settings: Sd,
			diagnostics: kd
		}, d = X(() => u[i.value] || ll), f = X(() => t.value.blocker.startsWith("检测到 SP") && t.value.persisted), p = X(() => f.value?.diaries || f.value?.acts?.filter((e) => e.diary).map((e) => ({
			id: e.id,
			title: e.title,
			body: e.diary
		})) || []), m = X(() => l.find((e) => e.id === i.value)?.label || (i.value === "settings" ? "设置" : "诊断")), h = /* @__PURE__ */ z(0), g = /* @__PURE__ */ z(window.innerHeight);
		Vn(r, (e, t, n) => {
			if (!e) return;
			let r = document.getElementById("top-settings-holder");
			function i() {
				g.value = window.visualViewport?.height || window.innerHeight, h.value = r && getComputedStyle(r).visibility !== "hidden" ? Math.max(0, r.getBoundingClientRect().bottom) : 0;
			}
			i();
			let a = new ResizeObserver(i);
			r && a.observe(r), window.addEventListener("resize", i), window.visualViewport?.addEventListener("resize", i), n(() => {
				a.disconnect(), window.removeEventListener("resize", i), window.visualViewport?.removeEventListener("resize", i);
			});
		});
		let _ = null;
		Vn(r, (e) => {
			e ? _ = document.activeElement : _?.focus();
		});
		function v(e) {
			e.key === "Escape" && !e.defaultPrevented && r.value && (r.value = !1, e.stopPropagation());
		}
		document.addEventListener("keydown", v), gr(() => document.removeEventListener("keydown", v));
		function y() {
			return s(() => Qs(n.backup(), "scene-diary-" + t.value.chatId + ".json"));
		}
		return (e, u) => B(r) ? (U(), W("div", {
			key: 0,
			class: "sd-backdrop",
			style: se({
				"--sd-toolbar-bottom": h.value + "px",
				"--sd-viewport-height": g.value + "px"
			}),
			"data-tt-mobile-surface": "backdrop",
			onClick: u[4] ||= Ro((e) => r.value = !1, ["self"])
		}, [G("section", Ad, [
			G("header", jd, [G("div", Md, [u[5] ||= G("i", {
				class: "fa-solid fa-clapperboard",
				"aria-hidden": "true"
			}, null, -1), G("h2", Nd, N(m.value), 1)]), G("div", Pd, [
				G("button", {
					class: "sd-icon",
					title: "设置",
					"aria-label": "设置",
					"aria-pressed": B(i) === "settings",
					onClick: u[0] ||= (e) => B(c)("settings")
				}, [...u[6] ||= [G("i", { class: "fa-solid fa-gear" }, null, -1)]], 8, Fd),
				G("button", {
					class: "sd-icon",
					title: "诊断",
					"aria-label": "诊断",
					"aria-pressed": B(i) === "diagnostics",
					onClick: u[1] ||= (e) => B(c)("diagnostics")
				}, [...u[7] ||= [G("i", { class: "fa-solid fa-list-check" }, null, -1)]], 8, Id),
				G("button", {
					class: "sd-icon",
					title: "关闭",
					"aria-label": "关闭",
					onClick: u[2] ||= (e) => r.value = !1
				}, [...u[8] ||= [G("i", { class: "fa-solid fa-xmark" }, null, -1)]])
			])]),
			G("nav", Ld, [(U(), W(H, null, Dr(l, (e) => G("button", {
				key: e.id,
				"aria-current": B(i) === e.id ? "page" : void 0,
				onClick: (t) => B(c)(e.id)
			}, [G("i", {
				class: fe("fa-solid " + e.icon),
				"aria-hidden": "true"
			}, null, 2), G("span", null, N(e.label), 1)], 8, Rd)), 64))]),
			G("div", zd, [
				B(t).saveError ? (U(), W("aside", Bd, [G("span", null, "保存失败。" + N(B(t).saveError) + " 当前内容仍可编辑。", 1), G("div", Vd, [G("button", { onClick: u[3] ||= (e) => B(s)(B(n).save) }, "重试保存"), B(t).state ? (U(), W("button", {
					key: 0,
					onClick: y
				}, "导出内容")) : J("", !0)])])) : J("", !0),
				B(a) ? (U(), W("aside", Hd, N(B(a)), 1)) : J("", !0),
				B(o) ? (U(), W("aside", Ud, N(B(o)), 1)) : J("", !0),
				f.value && [
					"growth",
					"diaries",
					"memory"
				].includes(B(i)) ? (U(), W(H, { key: 3 }, [G("p", Wd, N(B(t).blocker) + " 已有内容可查阅。", 1), B(i) === "growth" ? (U(), W("section", Gd, [u[9] ||= G("h3", null, "当前角色画像", -1), G("p", Kd, N(f.value.characterGrowth?.content || "尚未建立画像。"), 1)])) : B(i) === "diaries" ? (U(!0), W(H, { key: 1 }, Dr(p.value, (e) => (U(), W("article", {
					key: e.id,
					class: "sd-card sd-stack"
				}, [G("h3", null, N(e.title), 1), G("p", qd, N(e.body), 1)]))), 128)) : (U(!0), W(H, { key: 2 }, Dr(f.value.memories || [], (e) => (U(), W("article", {
					key: e.id,
					class: "sd-card sd-stack"
				}, [G("h3", null, N(e.title), 1), G("p", Jd, N(e.content), 1)]))), 128))], 64)) : f.value && B(i) === "settings" ? (U(), W("p", Yd, N(B(t).blocker), 1)) : (U(), ea(wr(d.value), { key: B(t).chatId + "-" + B(i) }))
			]),
			G("footer", Xd, [B(t).pendingSaves ? (U(), W("span", Zd, "正在保存…")) : B(t).saveError ? (U(), W("span", Qd, "保存失败")) : B(t).saved ? (U(), W("span", $d, "已提交宿主保存")) : (U(), W("span", ef, "scene&diary"))])
		])], 4)) : J("", !0);
	}
});
// recall-v8.js
function nf(e, t) {
	let n = e.filter((e) => _s(e) && typeof e.mes == "string" && e.mes.trim()), r = n.length;
	for (; r && !n[r - 1].is_user;) r--;
	return Ts(n.slice(Math.max(0, r - t.queryDepth - 1), r), t.extraction);
}
function rf(e, t, n, r, { localOnly: i = !1 } = {}) {
	let a = e.settings.semantic, o = (e, t, r = [], i = "success") => n({
		stage: e,
		title: t,
		details: r,
		status: i
	}), s = (e, n) => {
		r?.throwIfAborted(), o(e, Us(n, [t.embeddingKey, t.rerankKey]), [], "warning");
	};
	return async (n, c) => {
		let l = n.filter((e) => cc(e) && !e.permanent);
		if (!l.length || !c.trim()) return [];
		let u = {
			account: t.account,
			chat: t.chat,
			space: e.memorySpaceId + ":事实"
		}, d = Ls(l, e.memoryRevision, { poolSize: e.settings.retrievalCount }), f, p;
		if (!i && a.enabled) try {
			[f, [p]] = await Promise.all([of(l, u, a, t, r), Ks([c], a, t.embeddingKey, { signal: r })]);
		} catch (e) {
			s("向量检索", e);
		}
		r?.throwIfAborted();
		let m = d(c, {
			vectors: f,
			queryVector: p
		});
		o("初检", (f ? "BM25 + 向量" : "BM25") + " · " + m.length + " 条");
		let h = m.map((e) => e.relevance), g = "检索相关度";
		if (!i && a.rerank && m.length) try {
			h = await Gs(c, m.map((e) => e.memory.content), a, t.rerankKey, { signal: r }), g = "rerank";
		} catch (e) {
			s("重排", e);
		}
		r?.throwIfAborted();
		let _ = m.map((e, t) => ({
			...e,
			score: (80 * Math.max(0, Math.min(1, h[t])) + 5 * (e.memory.importance - 1)) / 100
		})).sort((e, t) => t.score - e.score || e.memory.id.localeCompare(t.memory.id));
		return o("精排", g, _.map((e) => e.score.toFixed(3) + " " + e.memory.title)), _;
	};
}
var af = /* @__PURE__ */ new Map();
async function of(e, t, n, r, i) {
	let a = "scene-diary", o = "vectors-" + ms(JSON.stringify([
		t.space,
		n.endpoint,
		n.model,
		n.dimensions
	])), s = JSON.stringify([t, o]), c = af.get(s), l = Promise.resolve(c).catch(() => {}).then(async () => {
		i?.throwIfAborted();
		let s = r.store, c = s ? await s.getJson({
			namespace: a,
			key: o
		}) || {} : null, l = c ? new Map(e.flatMap((e) => {
			let r = c[Vs(t, n, e)];
			return Array.isArray(r) ? [[e.id, r]] : [];
		})) : await qs(e, t, n), u = e.filter((e) => !l.has(e.id));
		for (let e = 0; e < u.length; e += 16) {
			let a = u.slice(e, e + 16), o = await Ks(a.map((e) => e.content), n, r.embeddingKey, { signal: i });
			i?.throwIfAborted(), s || await Js(a, o, t, n), a.forEach((e, t) => l.set(e.id, o[t]));
		}
		if (s && (u.length || Object.keys(c).length !== l.size)) {
			let r = Object.fromEntries(e.map((e) => [Vs(t, n, e), l.get(e.id)]));
			await s.setJson({
				namespace: a,
				key: o,
				value: r
			});
		}
		return l;
	});
	af.set(s, l);
	try {
		return await l;
	} finally {
		af.get(s) === l && af.delete(s);
	}
}
var sf = (e, t) => t.length ? "[scene&diary " + e + "]\n" + t.join("\n\n") + "\n[/scene&diary " + e + "]" : "";
async function cf(e, t, n, r) {
	let i = e.settings, a = e.diaries.filter((e) => !e.needsReview && e.body.trim()).sort((e, t) => t.createdAt - e.createdAt).slice(0, i.recentDiaryCount).reverse(), o = e.memories.filter(cc), s = o.filter((e) => e.permanent), c = i.retrievalCount && i.candidateCount && t.trim() ? await n(o.filter((e) => !e.permanent), t) : [], l = c.slice(0, i.candidateCount), u = l.filter((e) => e.score > i.recallScoreThreshold);
	return r({
		stage: "注入",
		status: "success",
		title: "常驻 " + s.length + " · 初检 " + c.length + " · 精排候选 " + l.length + " · 阈值淘汰 " + (l.length - u.length) + " · 普通记忆注入 " + u.length,
		details: [...s.map((e) => "常驻 · " + e.title), ...u.map((e) => "召回 · " + e.memory.title)]
	}), [
		sf("当前角色画像", i.growthEnabled && e.characterGrowth.content ? [e.characterGrowth.content] : []),
		sf("近期日记", a.map((e) => e.title + "\n" + e.body)),
		sf("常驻记忆", s.map(ks)),
		sf("长期记忆", u.map((e) => ks(e.memory)))
	].filter(Boolean).join("\n\n");
}
function lf(e, t) {
	return cf(e, t, rf(e, {}, () => {}, null, { localOnly: !0 }), () => {});
}
// host-v8.js
var uf = "0.5.2", df = (e) => ["confirmed", "skipped"].includes(e?.status);
async function ff(e, t, n = 0, r = !1, i = !1, a = null) {
	if (!t || !r && Number.isInteger(n) && e.length > n && e.slice(n).every(Boolean)) return e;
	let o = await t.tail({ limit: 100 }), s = o.startIndex + o.messages.length, c = Math.max(0, s - e.length), l = [], u = /* @__PURE__ */ new Map();
	for (e.forEach((e, t) => {
		if (!e) return;
		let n = t + c;
		l[n] = e, i && e.tt_swipe_cold && u.set(e.tt_swipe_cold.record - 1, n);
	});;) {
		for (let e = 0; e < o.messages.length; e++) {
			let t = o.startIndex + e, n = o.messages[e];
			if (l[t] ||= n, u.has(t)) {
				let e = u.get(t), { tt_swipe_cold: r, ...i } = l[e], a = (e, t) => e?.map((e, n) => e ?? t?.[n]) || t;
				l[e] = {
					...i,
					swipes: a(i.swipes, n.swipes),
					swipe_info: a(i.swipe_info, n.swipe_info)
				}, u.delete(t);
			}
		}
		if (!o.hasMoreBefore || o.startIndex <= n || a?.(l, o.startIndex)) {
			if (u.size) throw Error("无法读取完整的历史候选回复。");
			return l;
		}
		o = await t.before(o, { limit: 100 });
	}
}
function pf(e, t, n = globalThis) {
	let r = () => e(), i = () => r().chatMetadata, a = () => String(r().chatId ?? ""), o = () => r().chat || [], s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map(), l = () => n.SillyTavern?.libs?.localforage, u = $o("account"), d = () => {
		let e = r().accountStorage, t = e?.getItem("scene_diary_account_id") || u;
		return e?.getItem("scene_diary_account_id") || e?.setItem("scene_diary_account_id", t), t;
	}, f = null, p = Promise.resolve(), m = "", h = !1, g = 0, _ = "", v = [], y = "", b, x = 0, S = "", C = null, w = null, T = {}, ee = 0, te = async () => {
		let e = n.__TAURITAVERN__;
		return e ? (await e.ready, e.api?.chat?.current?.handle?.()) : null;
	}, E = (e) => !!e && f === e && e.id === a() && e.metadata === i(), D = () => f && E(f) && !_ ? i()?.[Go] : null, ne = () => D() || i()?.scene_diary, O = () => ({
		state: D(),
		persisted: ne(),
		chatId: a(),
		blocker: _,
		saveError: m,
		saved: h,
		pendingSaves: g,
		trace: v,
		growthProgress: S,
		growthPreview: C,
		growthFailure: w,
		closeRawResponses: T,
		dialogueRevision: ee,
		busy: [...c.keys()],
		channels: du(r()),
		messages: o().length
	}), k = () => s.forEach((e) => e(O()));
	function A(e) {
		if (!e || !E(e)) throw new DOMException("聊天已切换", "AbortError");
	}
	function j(e = !1) {
		let t = f;
		e && t.messageRevision++, g++, k();
		let n = p.then(async () => {
			if (!E(t)) return !1;
			let e = r(), n = t.messageRevision, i = n === t.savedMessageRevision ? e.saveMetadata || e.saveChat : e.saveChat || e.saveMetadata;
			if (!i) throw Error("宿主保存接口不可用。");
			return await i(), E(t) && (t.savedMessageRevision = n, m = "", h = !0), E(t);
		});
		return p = n.catch((e) => {
			E(t) && (m = e.message, h = !1);
		}).finally(() => {
			E(t) && (g--, k());
		}), n;
	}
	function M(e, t = !1) {
		let n = D();
		if (!n) throw Error("请先打开受支持的聊天。");
		let r = structuredClone(n), a = e(r);
		return r.lastUpdatedAt = Date.now(), i()[Go] = r, k(), j(t).then(() => a);
	}
	function re(e) {
		return "scene_diary_migration_backup_" + d() + "_" + a() + "_schema" + e + "_to8";
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
			}, m = "", h = !1, g = 0, v = [], y = "", S = "", C = null, w = null, T = {}, ee++, t("");
		}
		let p = f;
		if (!e || r().groupId || !s) {
			_ = "请选择一个单角色聊天。", k();
			return;
		}
		if (n.AutoCardUpdaterAPI) {
			_ = "检测到 SP·数据库，请停用 SP 并刷新后使用本扩展。", t(""), k();
			return;
		}
		let D = s[Go];
		if (D?.version > 8) _ = "聊天数据版本高于当前插件支持范围，请使用对应的插件版本。", k();
		else if (D && D.version !== 8) {
			_ = "正在备份旧聊天…", k();
			try {
				let t = re(D.version), n = await te(), r = await ff(o(), n?.history, 0, !0, !0);
				if (!E(p) || u !== x || (await l().getItem(t) || await l().setItem(t, {
					schema: D.version,
					savedAt: Date.now(),
					metadata: structuredClone(s),
					messages: structuredClone(r),
					pendingRecovery: D.memorySpaceId ? await l().getItem("scene_diary_recovery_" + d() + "_" + e + "_" + D.memorySpaceId) : null
				}), !E(p) || u !== x || s.scene_diary !== D)) return;
				s[Go] = _c(D), _ = "", await j();
			} catch (e) {
				E(p) && s.scene_diary === D && (_ = "迁移备份失败，旧聊天仍保留。" + e.message, k());
			}
		} else if (!D && o().filter(_s).length > 1) _ = "已有聊天，请选择开始接管的楼层。", k();
		else {
			if (_ = "", !D) await ae(0);
			else {
				let e = D.pendingTransaction;
				e && sc.some((t) => e.results[t]?.status === "running" && !c.has("close:" + t)) && await M((e) => {
					for (let t of sc) {
						let n = e.pendingTransaction.results[t];
						n?.status === "running" && !c.has("close:" + t) && (n.status = "error", n.error = "请求已中断，可单独重试本项。");
					}
				}), D.status === "active" && o().some((e) => _s(e) && !e.extra?.scene_diary?.actId) && await M((e) => o().forEach((t, n) => {
					_s(t) && !t.extra?.scene_diary?.actId && vs(e, t, e.currentActId, n);
				}), !0);
			}
			k();
		}
	}
	async function ae(e) {
		if (n.AutoCardUpdaterAPI || r().groupId || !a() || i()?.scene_diary) return;
		_ = "";
		let t = vc();
		o().forEach((n, r) => {
			r >= e && _s(n) && vs(t, n, 1, r);
		}), fs(t).startMessageIndex = e, i()[Go] = t, await j(!0);
	}
	async function oe(e, t) {
		if (!e.messageIds.length) return [];
		let n = o(), r = new Set(e.messageIds), i = (t) => t.filter((t) => _s(t) && Number(t.extra?.scene_diary?.actId) === e.id && r.has(t.extra?.scene_diary?.messageId)), a = i(n);
		if (a.length === r.size) return a;
		let s = await te();
		if (A(t), !s?.history) return a;
		let c = await ff(n, s.history, 0, !0);
		return A(t), n.every(Boolean) && c.length <= n.length ? a : i(c);
	}
	function se() {
		let e = r(), t = e.getCharacterCardFields?.() || {};
		return {
			char: e.name2 || t.name || "角色",
			user: e.name1 || "玩家",
			context: Ds(t)
		};
	}
	async function ce() {
		let e = f, t = D(), n = fs(t);
		if (!n || t.status !== "active") return;
		let r = await oe(n, e);
		if (!r.length) throw Error("本幕没有可整理的对话。");
		if (A(e), D() !== t) throw Error("当前幕已变化，请重新结束本幕。");
		await M((e) => {
			e.status = "preview", fs(e).status = "closing", e.pendingTransaction = {
				id: $o("close"),
				actId: n.id,
				sourceFingerprint: hs(r),
				character: se(),
				results: Object.fromEntries(sc.map((e) => [e, { status: "idle" }]))
			};
		}), await Promise.allSettled([me("diary"), me("memory")]);
	}
	function le(e) {
		if (c.has(e)) return null;
		let t = new AbortController();
		return c.set(e, t), k(), t;
	}
	function ue(e, t) {
		c.get(e) === t && (c.delete(e), k());
	}
	let de = (e, t) => {
		E(e) && (v.push(t), v.length > 100 && v.shift(), k());
	};
	function fe(e, t, n) {
		let i = new Map(du(r()).map((e) => [e.id, structuredClone(e)]));
		return (a, o) => {
			A(n), t.throwIfAborted();
			let s = i.get(e.settings.bindings[a]);
			if (!s) throw Error("请在设置中为「" + oc[a] + "」绑定自建渠道。");
			return _u(r(), s, a, o, t);
		};
	}
	async function pe(e, t, n, i) {
		let a = await te();
		A(t);
		let o = r().accountStorage;
		return rf(e, {
			chat: t.id,
			account: d(),
			store: a?.store,
			embeddingKey: o?.getItem("scene_diary_embedding_key") || "",
			rerankKey: o?.getItem("scene_diary_rerank_key") || ""
		}, (e) => de(t, e), n, i);
	}
	async function me(e) {
		let t = f, n = D(), r = n?.pendingTransaction;
		if (!r || !sc.includes(e)) return;
		let i = "close:" + e, a = le(i);
		if (!a) return;
		delete T[e];
		let o = a.signal, s = fe(n, o, t), l = r.results[e], u = () => E(t) && D()?.pendingTransaction?.id === r.id && c.get(i) === a;
		try {
			let i = structuredClone(await oe(fs(n), t));
			if (o.throwIfAborted(), !u() || hs(i) !== r.sourceFingerprint) throw Error("本幕对话已经修改，请取消关幕后重开审核。");
			await M((t) => {
				t.pendingTransaction.results[e] = {
					...l,
					status: "running",
					error: ""
				};
			}), o.throwIfAborted();
			let a = await au(e, n, r, i, s);
			if (!u()) return;
			if (o.throwIfAborted(), hs(await oe(fs(D()), t)) !== r.sourceFingerprint) throw Error("本幕对话已经修改，请取消关幕后重开审核。");
			if (!u()) return;
			o.throwIfAborted(), await M((t) => {
				t.pendingTransaction.results[e] = {
					status: "draft",
					value: a
				};
			}).catch(() => {});
		} catch (t) {
			if (!u()) return;
			let n = D().pendingTransaction.results[e];
			if (n.status === "outdated" || n.status === "skipped") return;
			t instanceof eu && typeof t.rawResponse == "string" && (T[e] = t.rawResponse), await M((n) => {
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
	async function he(e, t, n = !1, r = !0) {
		if (sc.includes(e) && !c.has("close:" + e) && D()?.pendingTransaction) {
			if (r && !n && e === "diary" && !$(t?.body)) throw Error("请填写日记正文。");
			if (!n && e === "memory" && !Array.isArray(t)) throw Error("请先提取记忆。");
			if (r && !n && e === "memory" && t.some((e) => e.accepted && !hc(e.value))) throw Error("请检查勾选记忆点的标题、内容和重要度。");
			await M((i) => {
				delete T[e], i.pendingTransaction.results[e] = n ? { status: "skipped" } : {
					status: r ? "confirmed" : "draft",
					value: t
				};
			});
		}
	}
	async function ge() {
		let e = f, t = D(), n = t?.pendingTransaction;
		if (!n || !sc.every((e) => df(n.results[e]))) throw Error("请先处理两项审核。");
		let r = await oe(fs(t), e);
		if (A(e), D() !== t) throw Error("审核内容已变化，请重试提交。");
		if (hs(r) !== n.sourceFingerprint) throw Error("本幕来源已变化，请取消后重新整理。");
		await M((e) => {
			let t = fs(e), { diary: i, memory: a } = n.results;
			a.status === "confirmed" && ou(e, a.value), i.status === "confirmed" && e.diaries.push(gc({
				...i.value,
				createdAt: Date.now()
			})), Object.assign(t, {
				status: "closed",
				closedAt: Date.now(),
				sourceFingerprint: n.sourceFingerprint,
				startMessageIndex: r[0]?.extra?.scene_diary?.messageIndex ?? t.startMessageIndex,
				endMessageIndex: r.at(-1)?.extra?.scene_diary?.messageIndex ?? t.endMessageIndex
			}), e.status = "pending_next_act", e.pendingTransaction = null, T = {};
		});
	}
	function _e() {
		for (let e of sc) {
			let t = "close:" + e;
			c.get(t)?.abort(), c.delete(t);
		}
		return T = {}, M((e) => {
			fs(e).status = "active", e.status = "active", e.pendingTransaction = null;
		});
	}
	function ve(e) {
		return e !== "growth" && D()?.pendingTransaction?.character || se();
	}
	async function ye() {
		let e = f;
		await p, A(e);
		let t = fs(D());
		return t ? oe(t, e) : [];
	}
	async function be(e = "recent") {
		let t = f, n = D(), r = nu(n, e);
		if (!r.length) throw Error("所选范围没有有效日记。");
		let i = le("growth");
		if (i) {
			w = null;
			try {
				S = "正在读取 " + r.length + " 篇日记…", k();
				let a = iu("growth", n, se(), [], e), o = await fe(n, i.signal, t)("growth", $l(a));
				i.signal.throwIfAborted(), A(t), C = {
					...o,
					mode: e,
					count: r.length,
					revision: n.characterGrowth.revision,
					diaries: JSON.stringify(r)
				};
			} catch (n) {
				if (i.signal.throwIfAborted(), A(t), n instanceof eu && typeof n.rawResponse == "string") {
					w = {
						message: n.message,
						rawResponse: n.rawResponse
					};
					return;
				}
				throw e === "global" && /context|too many tokens|input.*long|上下文|上下文长度/i.test(n.message) ? Error(n.message + "。请更换长上下文模型后重试。") : n;
			} finally {
				E(t) && (S = ""), ue("growth", i);
			}
		}
	}
	async function xe(e) {
		let t = C;
		t?.changed && (t.appliedRevision === D().characterGrowth.revision && e === D().characterGrowth.content ? await j() : await M((n) => {
			if (n.characterGrowth.revision !== t.revision || JSON.stringify(nu(n, t.mode)) !== t.diaries) throw Error("画像或本次日记已变化，请重新生成。");
			if (!$(e)) throw Error("请填写候选画像。");
			ac(n, e), t.appliedRevision = n.characterGrowth.revision;
		}), C === t && (C = null), k());
	}
	async function Se(e, t) {
		let r = o(), i = nf(r, e.settings);
		if (i.rows.length > e.settings.queryDepth || !n.__TAURITAVERN__) return i;
		let a = await te();
		if (A(t), !a?.history) return i;
		let s = await ff(r, a.history, 0, !0, !1, (t, n) => nf(t.slice(n), e.settings).rows.length > e.settings.queryDepth);
		return A(t), nf(s, e.settings);
	}
	async function N(e, i, a) {
		t(""), y = "";
		let o = D(), s = f;
		if (!o || n.AutoCardUpdaterAPI || !["active", "preview"].includes(o.status) || !Array.isArray(e)) return;
		b?.abort();
		let c = (b = new AbortController()).signal;
		v = [];
		try {
			let i = await Se(o, s);
			if (i.errors.length) throw Error("最近对话正文标签未匹配，请检查正文提取设置。");
			let a = await pe(o, s, c), l = await cf(o, i.text, a, (e) => de(s, e));
			if (A(s), c.throwIfAborted(), !["active", "preview"].includes(D()?.status) || D()?.currentActId !== o.currentActId) throw new DOMException("当前剧幕已变化", "AbortError");
			if (D() !== o) throw Error("聊天内容已更新，请重新生成。");
			e.splice(0, e.length, ...bs(e, o.currentActId)), String(r().mainApi).toLowerCase() === "openai" ? y = l : t(l, Math.min(e.length, 100)), v.some((e) => e.status === "warning") && n.toastr?.warning?.("语义召回部分失败，详情见 scene&diary 诊断。");
		} catch (e) {
			if (!c.aborted && E(s)) {
				let t = Us(e);
				de(s, {
					stage: "召回",
					status: "error",
					title: t
				}), n.toastr?.error?.(t);
			}
			a?.(!0);
		}
	}
	async function Ce(e) {
		let t = D(), r = f;
		if (!t || n.AutoCardUpdaterAPI || !["active", "preview"].includes(t.status) || !Array.isArray(e.chat)) return;
		let i = y;
		if (y = "", !e.dryRun) {
			As(e.chat, i);
			return;
		}
		let a = await Se(t, r);
		if (a.errors.length) return;
		let o = await lf(t, a.text);
		D() === t && As(e.chat, o);
	}
	function we(e, t) {
		let n = D(), r = o()[Number(e)];
		if (n && _s(r) && !!r.is_user === t && (["active", "preview"].includes(n.status) || t && n.status === "pending_next_act")) return M((t) => {
			t.status === "pending_next_act" ? ys(t, r, Number(e)) : vs(t, r, t.currentActId, Number(e));
		}, !0);
	}
	function P(e) {
		let t = D();
		if (!t) return;
		let n = o()[Number(e)]?.extra?.scene_diary?.actId, r = !n || n === t.currentActId;
		if (r && ee++, !t.diaries.length || n && t.acts.find((e) => e.id === n)?.status !== "closed" || t.characterGrowth.reviewRecommended) r && k();
		else return M((e) => {
			e.characterGrowth.reviewRecommended = !0;
		});
	}
	function Te() {
		let e = r(), i = e.eventTypes || {}, a = (t, r, a) => e.eventSource?.on(i[t] || r, (...e) => {
			try {
				return Promise.resolve(a(...e)).catch((e) => {
					m || n.toastr?.error?.(e.message);
				});
			} catch (e) {
				n.toastr?.error?.(e.message);
			}
		});
		return a("CHAT_CHANGED", "chat_id_changed", ie), a("CHAT_LOADED", "chatLoaded", ie), a("MESSAGE_SENT", "message_sent", (e) => we(e, !0)), a("MESSAGE_RECEIVED", "message_received", (e) => we(e, !1)), a("MESSAGE_EDITED", "message_edited", P), a("MESSAGE_UPDATED", "message_updated", P), a("MESSAGE_SWIPED", "message_swiped", P), a("MESSAGE_DELETED", "message_deleted", () => P()), a("CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready", Ce), a("GENERATION_STOPPED", "generation_stopped", () => {
			b?.abort(), y = "", t("");
		}), ie();
	}
	return {
		snapshot: O,
		subscribe(e) {
			return s.add(e), e(O()), () => s.delete(e);
		},
		connect: Te,
		initialize: ie,
		takeOver: ae,
		mutate: M,
		save: j,
		getContext: e,
		rearrange: N,
		promptReady: Ce,
		openClose: ce,
		runClose: me,
		reviewPart: he,
		confirmClose: ge,
		cancelClose: _e,
		previewCharacter: ve,
		readPreviewDialogue: ye,
		generateGrowth: be,
		acceptGrowth: xe,
		discardGrowth() {
			C = null, k();
		},
		cancel(e) {
			c.get(e)?.abort();
		},
		refresh: k,
		backup: () => bc(D(), a()),
		import: (e) => M((t) => Object.assign(t, xc(t, e, a()))),
		migrationBackup: async () => {
			for (let e = 7; e > 0; e--) {
				let t = await l()?.getItem(re(e));
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
function mf(e) {
	let t = document.createElement("button");
	t.className = "menu_button sd-qr-entry", t.type = "button", t.title = "打开 scene&diary 剧幕工作台", t.setAttribute("aria-label", t.title), t.innerHTML = "<i class=\"fa-solid fa-clapperboard\" aria-hidden=\"true\"></i><span>剧幕工作台</span>", t.addEventListener("click", e);
	let n = document.getElementById("send_form");
	function r() {
		let e = n?.querySelector("#qr--bar") || document.querySelector("#qr--popout > .qr--body") || document.getElementById("extensionsMenu");
		e && t.parentElement !== e && e.prepend(t);
	}
	let i = new MutationObserver(r);
	i.observe(document.body, { childList: !0 }), n && i.observe(n, { childList: !0 }), r();
}
function hf(e, t) {
	let n = pf(e, t);
	Object.assign(globalThis, {
		sceneDiaryRearrangeChat: n.rearrange,
		sceneDiary: {
			version: uf,
			...n
		}
	});
	let r = () => {
		if (document.getElementById("scene-diary-root")) return;
		let e = document.createElement("div");
		e.id = "scene-diary-root", document.body.append(e);
		let t = Ys(n);
		Ho(tf).provide(Xs, t).mount(e), mf(t.openWorkbench), t.run(n.connect);
	};
	document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r, { once: !0 }) : r();
}
export { hf as install };

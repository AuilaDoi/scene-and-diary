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
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => x(e) === "[object Map]", p = (e) => x(e) === "[object Set]", m = (e) => x(e) === "[object Date]", h = (e) => typeof e == "function", g = (e) => typeof e == "string", _ = (e) => typeof e == "symbol", v = (e) => typeof e == "object" && !!e, y = (e) => (v(e) || h(e)) && h(e.then) && h(e.catch), b = Object.prototype.toString, x = (e) => b.call(e), S = (e) => x(e).slice(8, -1), C = (e) => x(e) === "[object Object]", w = (e) => g(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ee = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), te = 1e4, T = (e) => {
	let t = /* @__PURE__ */ Object.create(null), n = 0;
	return ((r) => {
		let i = t[r];
		return i === void 0 ? (++n > te && (t = /* @__PURE__ */ Object.create(null), n = 1), t[r] = e(r)) : i;
	});
}, E = /-\w/g, D = /* @__PURE__ */ T((e) => e.replace(E, (e) => e.slice(1).toUpperCase())), O = /\B([A-Z])/g, k = /* @__PURE__ */ T((e) => e.replace(O, "-$1").toLowerCase()), A = /* @__PURE__ */ T((e) => e.charAt(0).toUpperCase() + e.slice(1)), ne = /* @__PURE__ */ T((e) => e ? `on${A(e)}` : ""), j = (e, t) => !Object.is(e, t), M = (e, ...t) => {
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
		let o = Reflect.get(e, t, /* @__PURE__ */ Kt(e) ? e : n);
		if ((_(t) ? pt.has(t) : ft(t)) || (r || I(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Kt(o)) {
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
			if (!/* @__PURE__ */ Vt(n) && !/* @__PURE__ */ Bt(n) && (i = /* @__PURE__ */ L(i), n = /* @__PURE__ */ L(n)), !a && /* @__PURE__ */ Kt(i) && !/* @__PURE__ */ Kt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Kt(e) ? e : r);
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
function Kt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function R(e) {
	return Jt(e, !1);
}
// @__NO_SIDE_EFFECTS__
function qt(e) {
	return Jt(e, !0);
}
function Jt(e, t) {
	return /* @__PURE__ */ Kt(e) ? e : new Yt(e, t);
}
var Yt = class {
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
function Xt(e) {
	e.dep && e.dep.trigger();
}
function z(e) {
	return /* @__PURE__ */ Kt(e) ? e.value : e;
}
var Zt = {
	get: (e, t, n) => t === "__v_raw" ? e : z(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Kt(i) && !/* @__PURE__ */ Kt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Qt(e) {
	return /* @__PURE__ */ zt(e) ? e : new Proxy(e, Zt);
}
var $t = class {
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
function en(e) {
	return new $t(e);
}
var tn = class {
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
function nn(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new tn(r, i, n);
}
var rn = {}, an = /* @__PURE__ */ new WeakMap(), on = void 0;
function sn(e, t = !1, n = on) {
	if (n) {
		let t = an.get(n);
		t || an.set(n, t = []), t.push(e);
	}
}
function cn(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Vt(e) || o === !1 || o === 0 ? ln(e, 1) : ln(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ Kt(e) ? (g = () => e.value, y = /* @__PURE__ */ Vt(e)) : /* @__PURE__ */ zt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ zt(e) || /* @__PURE__ */ Vt(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ Kt(e)) return e.value;
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
		let t = on;
		on = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			on = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => ln(e(), t);
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
	let C = b ? Array(e.length).fill(rn) : rn, w = (e) => {
		if (m.flags & 1 && (m.dirty || e)) {
			if (n) {
				let t = m.run();
				if (e || o || y || (b ? t.some((e, t) => j(e, C[t])) : j(t, C))) {
					let e = on;
					Ue();
					try {
						_ && _(), on = m;
						let e = [
							t,
							C === rn ? void 0 : b && C[0] === rn ? [] : C,
							v
						];
						C = t, f ? f(n, 3, e) : n(...e);
					} finally {
						on = e, We();
					}
				}
			} else m.run();
		}
	};
	return u && u(w), m = new Oe(g), m.scheduler = l ? () => l(w, !1) : w, v = (e) => sn(e, !1, m), _ = m.onStop = () => {
		let e = an.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			an.delete(m);
		}
	}, n ? a ? w(!0) : C = m.run() : l ? l(w.bind(null, !0), !0) : m.run(), S.pause = m.pause.bind(m), S.resume = m.resume.bind(m), S.stop = S, S;
}
function ln(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ Kt(e)) ln(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) ln(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		ln(e, t, n);
	});
	else if (C(e)) {
		for (let r in e) ln(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && ln(e[r], t, n);
	}
	return e;
}
// node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function un(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		fn(e, t, n);
	}
}
function dn(e, t, n, r) {
	if (h(e)) {
		let i = un(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			fn(e, t, n, void 0, !0);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(dn(e[a], t, n, r));
		return i;
	}
}
function fn(e, n, r, i = !0, a = !1) {
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
			Ue(), un(s, null, 10, [
				e,
				i,
				o
			]), We();
			return;
		}
	}
	pn(e, r, o, i, c);
}
function pn(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var mn = [], hn = -1, gn = [], _n = null, vn = 0, yn = /* @__PURE__ */ Promise.resolve(), bn = null;
function xn(e) {
	let t = bn || yn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function Sn(e) {
	let t = hn + 1, n = mn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = mn[r], a = An(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function Cn(e) {
	if (!(e.flags & 1)) {
		let t = An(e), n = mn[mn.length - 1];
		!n || !(e.flags & 2) && t >= An(n) ? mn.push(e) : mn.splice(Sn(t), 0, e), e.flags |= 1, wn();
	}
}
function wn() {
	bn ||= yn.then(jn);
}
function Tn(e) {
	if (!d(e)) _n && e.id === -1 ? _n.splice(vn + 1, 0, e) : e.flags & 1 || (gn.push(e), e.flags |= 1);
	else for (let t = 0; t < e.length; t++) gn.push(e[t]);
	wn();
}
function En(e, t, n, r = hn + 1) {
	for (; r < mn.length; r++) {
		let n = mn[r];
		if (n && n.flags & 2) {
			if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t)) continue;
			mn.splice(r, 1), r = e ? r - 1 : hn, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
		}
	}
}
function Dn(e, t, n = 0) {
	if (gn.length) {
		let e = gn, r = 0;
		if (t) {
			e = [];
			for (let i = 0; i < gn.length; i++) {
				let a = gn[i];
				(a.i === void 0 ? t.has(a) : !a.i || a.i.uid < n) ? gn[r++] = a : e.push(a);
			}
		}
		let i = [...new Set(e)].sort((e, t) => An(e) - An(t));
		if (gn.length = r, _n) {
			for (let e = 0; e < i.length; e++) _n.push(i[e]);
			return;
		}
		for (_n = i, vn = 0; vn < _n.length; vn++) {
			let e = _n[vn];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		_n = null, vn = 0;
	}
}
var On = !1;
function kn(e, t) {
	if (On) {
		e();
		return;
	}
	let n = t === void 0 ? void 0 : new Set(gn);
	e(), On = !0;
	try {
		En(void 0, t), Dn(void 0, n, t);
	} finally {
		On = !1;
	}
}
var An = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function jn(e) {
	try {
		for (hn = 0; hn < mn.length; hn++) {
			let e = mn[hn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), un(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; hn < mn.length; hn++) {
			let e = mn[hn];
			e && (e.flags &= -2);
		}
		hn = -1, mn.length = 0, Dn(e), bn = null, (mn.length || gn.length) && jn(e);
	}
}
var Mn = null, Nn = null;
function Pn(e) {
	let t = Mn;
	return Mn = e, Nn = e && e.type.__scopeId || null, t;
}
function Fn(e, t = Mn, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Qi(-1);
		let i = Pn(t), a = Ji.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = Ji.length; e > a; e--) Xi();
			Pn(i), r._d && Qi(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function B(e, n) {
	if (Mn === null) return e;
	let r = Ma(Mn), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && ln(o), i.push({
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
function In(e, t, n, r) {
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
		u && (Ue(), dn(u, n, 8, [
			e.el,
			l,
			i,
			t
		]), We());
	}
}
function Ln(e, t) {
	if (_a) {
		let n = _a.provides, r = _a.parent && _a.parent.provides;
		r === n && (n = _a.provides = Object.create(r)), n[e] = t;
	}
}
function Rn(e, t, n = !1) {
	let r = va();
	if (r || Qr) {
		let i = Qr ? Qr._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var zn = /* @__PURE__ */ Symbol.for("v-scx"), Bn = () => Rn(zn);
function Vn(e, t) {
	return Un(e, null, { flush: "sync" });
}
function Hn(e, t, n) {
	return Un(e, t, n);
}
function Un(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (wa) {
		if (c === "sync") {
			let e = Bn();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = _a;
	u.call = (e, t, n) => dn(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		e.i = p, ji(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : Cn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = cn(e, n, u);
	return wa && (f ? f.push(h) : d && h()), h;
}
function Wn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Gn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = xa(this), s = Un(i, a.bind(r), n);
	return o(), s;
}
function Gn(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Kn = /* @__PURE__ */ Symbol("_vte"), qn = (e) => e.__isTeleport, Jn = /* @__PURE__ */ Symbol("_leaveCb");
function Yn(e) {
	let t = e[0];
	if (e.length > 1) {
		for (let n of e) if (n.type !== Ki) {
			t = n;
			break;
		}
	}
	return t;
}
function Xn(e) {
	if (!or(e)) return qn(e.type) && e.children ? Yn(e.children) : e;
	if (e.component) return e.component.subTree;
	let { shapeFlag: t, children: n } = e;
	if (n) {
		if (t & 16) return n[0];
		if (t & 32 && h(n.default)) return n.default();
	}
}
function Zn(e, t) {
	if (e.shapeFlag & 6 && e.component) {
		e.transition = t;
		let n = e.component.subTree;
		Zn(qn(n.type) && Xn(n) || n, t);
	} else if (e.shapeFlag & 128) {
		let n = e.suspense;
		if (n) {
			let e = n.isHydrating ? n.pendingBranch : n.activeBranch;
			e && Zn(e, t.clone(e));
		} else e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
	} else if (e.transition = t, e.type === H && d(e.children)) {
		let n = oi(e.children, !1);
		n && Zn(n, t);
	}
}
function Qn(e) {
	if (e.component) return Qn(e.component.subTree);
	if (e.type === H) {
		let t = d(e.children) && oi(e.children, !1);
		return t ? Qn(t) : void 0;
	}
	if (e.type !== Ki) return e;
}
// @__NO_SIDE_EFFECTS__
function $n(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function er(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function tr(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var nr = /* @__PURE__ */ new WeakMap();
function rr(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => rr(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (ar(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && rr(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? Ma(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ L(v), b = v === t ? i : (e) => !tr(_, e) && u(y, e), x = (e, t) => !(t && tr(_, t));
	if (m != null && m !== p) {
		if (ir(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ Kt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) un(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ Kt(p);
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
					i(), nr.delete(e);
				};
				t.id = -1, nr.set(e, t), ji(t, r);
			} else ir(e), i();
		}
	}
}
function ir(e) {
	let t = nr.get(e);
	t && (t.flags |= 8, nr.delete(e));
}
oe().requestIdleCallback, oe().cancelIdleCallback;
var ar = (e) => !!e.type.__asyncLoader, or = (e) => e.type.__isKeepAlive;
function sr(e, t) {
	lr(e, "a", t);
}
function cr(e, t) {
	lr(e, "da", t);
}
function lr(e, t, n = _a) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (dr(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) or(e.parent.vnode) && ur(r, t, n, e), e = e.parent;
	}
}
function ur(e, t, n, r) {
	let i = dr(t, e, r, !0), a = dr("um", () => c(r[t], i), n);
	a.flags = 16;
}
function dr(e, t, n = _a, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Ue();
			let i = xa(n), a = dn(t, n, e, r);
			return i(), We(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var fr = (e) => (t, n = _a) => {
	wa && e !== "sp" || dr(e, (...e) => t(...e), n);
}, pr = fr("bm"), mr = fr("m"), hr = fr("bu"), gr = fr("u"), _r = fr("bum"), vr = fr("um"), yr = fr("sp"), br = fr("rtg"), xr = fr("rtc");
function Sr(e, t = _a) {
	dr("ec", e, t);
}
var Cr = "components", wr = /* @__PURE__ */ Symbol.for("v-ndc");
function Tr(e) {
	return g(e) ? Er(Cr, e, !1) || e : e || wr;
}
function Er(e, t, n = !0, r = !1) {
	let i = Mn || _a;
	if (i) {
		let n = i.type;
		if (e === Cr) {
			let e = Na(n, !1);
			if (e && (e === t || e === D(t) || e === A(D(t)))) return n;
		}
		let a = Dr(i[e] || n[e], t) || Dr(i.appContext[e], t);
		return !a && r ? n : a;
	}
}
function Dr(e, t) {
	return e && (e[t] || e[D(t)] || e[A(D(t))]);
}
function V(e, t, n, r) {
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
var Or = (e) => e ? Ca(e) ? Ma(e) : Or(e.parent) : null, kr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
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
		Cn(e.update);
	},
	$nextTick: (e) => e.n ||= xn.bind(e.proxy),
	$watch: (e) => Wn.bind(e)
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
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: S, destroyed: C, unmounted: w, render: ee, renderTracked: te, renderTriggered: T, errorCaptured: E, serverPrefetch: D, expose: O, inheritAttrs: k, components: A, directives: ne, filters: j } = t;
	if (u && Ir(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Ft(t));
	}
	if (Pr = !0, o) for (let e in o) {
		let t = o[e], a = Y({
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
			Ln(t, e[t]);
		});
	}
	f && Lr(f, e, "c");
	function M(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (M(pr, p), M(mr, m), M(hr, g), M(gr, _), M(sr, y), M(cr, b), M(Sr, E), M(xr, te), M(br, T), M(_r, S), M(vr, w), M(yr, D), d(O)) {
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
	ee && e.render === r && (e.render = ee), k != null && (e.inheritAttrs = k), A && (e.components = A), ne && (e.directives = ne), D && er(e);
}
function Ir(e, t, n = r) {
	d(e) && (e = Wr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Rn(r.from || n, r.default, !0) : Rn(r.from || n) : Rn(r), /* @__PURE__ */ Kt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function Lr(e, t, n) {
	dn(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Rr(e, t, n, r) {
	let i = r.includes(".") ? Gn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && Hn(i, n);
	} else if (h(e)) Hn(i, e.bind(n));
	else if (v(e)) {
		if (d(e)) e.forEach((e) => Rr(e, t, n, r));
		else {
			let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
			h(r) && Hn(i, r, e);
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
			version: Fa,
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
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Ma(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (dn(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
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
	let i = va(), a = D(n), o = k(n), s = ei(e, a), c = en((s, c) => {
		let l, u = t, d;
		return Vn(() => {
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
var ei = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${D(t)}Modifiers`] || e[`${k(t)}Modifiers`];
function ti(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ei(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = a.map(ie)));
	let c, l = i[c = ne(n)] || i[c = ne(D(n))];
	!l && o && (l = i[c = ne(k(n))]), l && dn(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, dn(u, e, 6, a);
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
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, k(t)) || u(e, t));
}
function ai(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = Pn(e), v, y;
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
		Ji.length = 0, fn(t, e, 1), v = K(Ki);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = ci(y, a)), b = sa(b, y, !1, !0));
	}
	return n.dirs && (b = sa(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && Zn(qn(b.type) && Xn(b) || b, n.transition), v = b, Pn(_), v;
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
		for (let a in s) t && (u(t, a) || (r = k(a)) !== a && u(t, r)) || (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = yi(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) t && u(t, e) || (delete a[e], l = !0);
	}
	l && et(e.attrs, "set", "");
}
function vi(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (ee(t)) continue;
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
					let o = xa(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === k(n)) && (r = !0));
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
	return e[0] !== "$" && !ee(e);
}
var Ci = (e) => e === "_" || e === "_ctx" || e === "$stable", wi = (e) => d(e) ? e.map(ca) : [ca(e)], Ti = (e, t, n) => {
	if (t._n) return t;
	let r = Fn((...e) => wi(t(...e)), n);
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
				A(e, t, r, i, a, o, s, c, l);
				break;
			default: f & 1 ? w(e, t, r, i, a, o, s, c, l) : f & 6 ? ne(e, t, r, i, a, o, s, c, l) : (f & 64 || f & 128) && u.process(e, t, r, i, a, o, s, c, l, ve);
		}
		d != null && a ? rr(d, e && e.ref, o, t || e, !t) : d == null && e && e.ref != null && rr(e.ref, null, o, e, !0);
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
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) te(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), D(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, te = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && E(e.children, d, null, r, i, Pi(e, a), s, u), _ && In(e, null, r, "created"), T(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !ee(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && fa(f, r, e);
		}
		_ && In(e, null, r, "beforeMount");
		let v = Ii(i, g);
		v ? g.beforeEnter(d) : g && !g.persisted && (d[Ui] = !0), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && ji(() => {
			try {
				f && fa(f, r, e), v && g.enter(d), _ && In(e, null, r, "mounted");
			} finally {}
		}, i);
	}, T = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Hi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				T(e, t, t.scopeId, t.slotScopeIds, i.parent);
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
		if (r && Fi(r, !1), (g = h.onVnodeBeforeUpdate) && fa(g, r, n, e), f && In(n, e, r, "beforeUpdate"), r && Fi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? O(e.dynamicChildren, d, l, r, i, Pi(n, a), o) : s || se(e, n, l, null, r, i, Pi(n, a), o, !1), u > 0) {
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
		((g = h.onVnodeUpdated) || f) && ji(() => {
			g && fa(g, r, n, e), f && In(n, e, r, "updated");
		}, i);
	}, O = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el || Vi(c), d = u && (c.type === H || !na(c, l) || c.shapeFlag & 198) ? m(u) : n;
			v(c, l, d, null, r, i, a, o, !0);
		}
	}, k = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !ee(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (ee(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, A = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), E(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (O(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Li(e, t, !0)) : se(e, t, n, f, i, a, s, c, l);
	}, ne = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : j(t, n, r, i, a, o, c) : re(e, t, c);
	}, j = (e, t, n, r, i, a, o) => {
		let s = e.component = ga(e, r, i);
		if (or(e) && (s.ctx.renderer = ve), Ta(s, !1, o), s.asyncDep) {
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
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = ar(t);
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
				(t.shapeFlag & 256 || d && ar(d.vnode) && d.vnode.shapeFlag & 256) && e.a && ji(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Oe(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => Cn(u), Fi(e, !0), l();
	}, ae = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, _i(e, t.props, r, n), Ai(e, t.children, n), Ue(), En(e), We();
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
			if (r === 0) l.persisted && !a[Jn] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), ji(() => l.enter(a), i));
			else {
				let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
					e.ctx.isUnmounted ? s(a) : o(a, t, n);
				}, d = () => {
					let e = a._isLeaving || !!a[Jn];
					a._isLeaving && a[Jn](!0), l.persisted && !e ? u() : r(a, () => {
						u(), c && c();
					});
				};
				i ? i(a, u, d) : d();
			}
		} else o(a, t, n);
	}, de = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if ((d === -2 || l && l.hasOnce) && (i = !1), s != null && (Ue(), rr(s, null, n, e, !0), We()), p == null || e.ctx && e.ctx !== t || (t.renderCache[p] = void 0), u & 256 && t.ctx.deactivate(e)) return;
		let h = u & 1 && f, g = !ar(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && fa(_, t, e), u & 6) me(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && In(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, ve, r) : l && !l.hasOnce && (a !== H || d > 0 && d & 64) ? he(l, t, n, !1, !0) : (a === H && d & 384 || !i && u & 16) && he(c, t, n), r && fe(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && ji(() => {
			_ && fa(_, t, e), h && In(e, null, t, "unmounted"), v && (e.el = null);
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
		let o = a ? Qn(e) : e, c = () => {
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
		let t = h(e.anchor || e.el), n = t && t[Kn];
		return n ? h(n) : t;
	}, _e = (e, t, n) => {
		kn(() => {
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
		pbc: O,
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
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : Tn(e);
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
var ra = ({ key: e }) => e ?? null, ia = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Kt(e) || h(e) ? {
	i: Mn,
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
		scopeId: Nn,
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
		ctx: Mn
	};
	return s ? (ua(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), Zi > 0 && !o && Yi && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Yi.push(c), c;
}
var K = aa;
function aa(e, t = null, n = null, r = 0, i = null, a = !1) {
	if (e && e !== wr || (e = Ki), ta(e)) {
		let r = sa(e, t, !0);
		return n && ua(r, n), Zi > 0 && !a && Yi && (r.shapeFlag & 6 ? Yi[Yi.indexOf(e)] = r : Yi.push(r)), r.patchFlag = -2, r;
	}
	if (Pa(e) && (e = e.__vccOpts), t) {
		t = oa(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = fe(e)), v(n) && (/* @__PURE__ */ Ht(n) && !d(n) && (n = s({}, n)), t.style = se(n));
	}
	let o = g(e) ? 1 : Hi(e) ? 128 : qn(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return G(e, t, n, r, i, o, a, !0);
}
function oa(e) {
	return e ? /* @__PURE__ */ Ht(e) ? s({}, e) : hi(e) ? s({}, e[ka] || e) : e : null;
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
	return c && r && Zn(u, c.clone(u)), u;
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
			!r && !hi(t) ? t._ctx = Mn : r === 3 && Mn && (Mn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
		}
	} else if (h(t)) {
		if (r & 65) {
			ua(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: Mn
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
	dn(e, t, 7, [n, r]);
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
var _a = null, va = () => _a || Mn, ya, ba;
{
	let e = oe(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	ya = t("__VUE_INSTANCE_SETTERS__", (e) => _a = e), ba = t("__VUE_SSR_SETTERS__", (e) => wa = e);
}
var xa = (e) => {
	let t = _a;
	return ya(e), e.scope.on(), () => {
		e.scope.off(), ya(t);
	};
}, Sa = () => {
	_a && _a.scope.off(), ya(null);
};
function Ca(e) {
	return e.vnode.shapeFlag & 4;
}
var wa = !1;
function Ta(e, t = !1, n = !1) {
	t && ba(t);
	let { props: r, children: i } = e.vnode, a = Ca(e);
	gi(e, r, a, t), ki(e, i, n || t);
	let o = a ? Ea(e, t) : void 0;
	return t && ba(!1), o;
}
function Ea(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, jr);
	let { setup: r } = n;
	if (r) {
		Ue();
		let n = e.setupContext = r.length > 1 ? ja(e) : null, i = xa(e), a = un(r, e, 0, [e.props, n]), o = y(a);
		if (We(), i(), (o || e.sp) && !ar(e) && er(e), o) {
			if (a.then(Sa, Sa), t) return a.then((n) => {
				ba(!0);
				try {
					Da(e, n, t);
				} finally {
					ba(!1);
				}
			}).catch((t) => {
				fn(t, e, 0, void 0, !0), e.ssrRender = (e, t) => t("<!---->");
			});
			e.asyncDep = a;
		} else Da(e, a, t);
	} else Oa(e, t);
}
function Da(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Qt(t)), Oa(e, n);
}
function Oa(e, t, n) {
	let i = e.type;
	e.render ||= i.render || r;
	{
		let t = xa(e);
		Ue();
		try {
			Fr(e);
		} finally {
			We(), t();
		}
	}
}
var ka = /* @__PURE__ */ Symbol(), Aa = { get(e, t) {
	return I(e, "get", ""), t === ka ? e : e[t];
} };
function ja(e) {
	return {
		attrs: new Proxy(e.attrs, Aa),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Ma(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Qt(Ut(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in kr) return kr[n](e);
		},
		has(e, t) {
			return t in e || t in kr;
		}
	}) : e.proxy;
}
function Na(e, t = !0) {
	return h(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function Pa(e) {
	return h(e) && "__vccOpts" in e;
}
var Y = (e, t) => /* @__PURE__ */ nn(e, t, wa), Fa = "3.5.46", Ia = void 0, La = typeof window < "u" && window.trustedTypes;
if (La) try {
	Ia = /* @__PURE__ */ La.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Ra = Ia ? (e) => Ia.createHTML(e) : (e) => e, za = "http://www.w3.org/2000/svg", Ba = "http://www.w3.org/1998/Math/MathML", Va = typeof document < "u" ? document : null, Ha = Va && /* @__PURE__ */ Va.createElement("template"), Ua = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Va.createElementNS(za, e) : t === "mathml" ? Va.createElementNS(Ba, e) : n ? Va.createElement(e, { is: n }) : Va.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Va.createTextNode(e),
	createComment: (e) => Va.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Va.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), i !== a && (i = i.nextSibling););
		else {
			Ha.innerHTML = Ra(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Ha.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Wa = /* @__PURE__ */ Symbol("_vtc");
function Ga(e, t, n) {
	let r = e[Wa];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Ka = /* @__PURE__ */ Symbol("_vod"), qa = /* @__PURE__ */ Symbol("_vsh"), Ja = /* @__PURE__ */ Symbol(""), Ya = /(?:^|;)\s*display\s*:/;
function Xa(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) {
			if (g(t)) for (let e of t.split(";")) {
				let t = e.slice(0, e.indexOf(":")).trim();
				n[t] ?? Qa(r, t, "");
			}
			else for (let e in t) n[e] ?? Qa(r, e, "");
		}
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? Qa(r, i, "") : no(e, i, !g(t) && t ? t[i] : void 0, o) || Qa(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[Ja];
			e && (n += ";" + e), r.cssText = n, a = Ya.test(n);
		}
	} else t && e.removeAttribute("style");
	Ka in e && (i && t === n || (e[Ka] = a ? r.display : ""), e[qa] && (r.display = "none"));
}
var Za = /\s*!important$/;
function Qa(e, t, n) {
	if (d(n)) n.forEach((n) => Qa(e, t, n));
	else if (n ??= "", t.startsWith("--")) Za.test(n) ? e.setProperty(t, n.replace(Za, ""), "important") : e.setProperty(t, n);
	else {
		let r = to(e, t);
		Za.test(n) ? e.setProperty(k(r), n.replace(Za, ""), "important") : e[r] = n;
	}
}
var $a = [
	"Webkit",
	"Moz",
	"ms"
], eo = {};
function to(e, t) {
	let n = eo[t];
	if (n) return n;
	let r = D(t);
	if (r !== "filter" && r in e) return eo[t] = r;
	r = A(r);
	for (let n = 0; n < $a.length; n++) {
		let i = $a[n] + r;
		if (i in e) return eo[t] = i;
	}
	return t;
}
function no(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var ro = "http://www.w3.org/1999/xlink";
function io(e, t, n, r, i, a = pe(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ro, t.slice(6, t.length)) : e.setAttributeNS(ro, t, n) : n == null || a && !me(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function ao(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Ra(n) : n);
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
function oo(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function so(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var co = /* @__PURE__ */ Symbol("_vei");
function lo(e, t, n, r, i = null) {
	let a = e[co] || (e[co] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = po(t);
		r ? oo(e, n, a[t] = _o(r, i), s) : o && (so(e, n, o, s), a[t] = void 0);
	}
}
var uo = /(Once|Passive|Capture)$/, fo = /^on:?(?:Once|Passive|Capture)$/;
function po(e) {
	let t, n;
	for (; (n = e.match(uo)) && !fo.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : k(e.slice(2)), t];
}
var mo = 0, ho = /* @__PURE__ */ Promise.resolve(), go = () => mo ||= (ho.then(() => mo = 0), Date.now());
function _o(e, t) {
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
				e && dn(e, t, 5, a);
			}
		} else dn(r, t, 5, [e]);
	};
	return n.value = e, n.attached = go(), n;
}
var vo = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, yo = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? Ga(e, r, c) : t === "style" ? Xa(e, n, r) : a(t) ? o(t) || lo(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), 1) : t[0] === "^" ? (t = t.slice(1), 0) : bo(e, t, r, c)) ? (ao(e, t, r), e.tagName.includes("-") || t !== "value" && t !== "checked" && t !== "selected" || io(e, t, r, c, s, t !== "value")) : e._isVueCE && (xo(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? ao(e, D(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), io(e, t, r, c));
};
function bo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && vo(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return vo(t) && g(n) ? !1 : t in e;
}
function xo(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = D(t);
	return Array.isArray(n) ? n.some((e) => D(e) === r) : Object.keys(n).some((e) => D(e) === r);
}
var So = (e) => {
	let t = e.props["onUpdate:modelValue"] || !1;
	return d(t) ? (e) => M(t, e) : t;
};
function Co(e) {
	e.target.composing = !0;
}
function wo(e) {
	let t = e.target;
	t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
var To = /* @__PURE__ */ Symbol("_assign"), Eo = /* @__PURE__ */ Symbol("_initialValue");
function Do(e, t, n) {
	return t && (e = e.trim()), n && (e = ie(e)), e;
}
var X = {
	created(e, { modifiers: { lazy: t, trim: n, number: r } }, i) {
		e.parentNode && (e.type === "text" ? e[Eo] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[Eo] = e.defaultValue.replace(/\r\n?/g, "\n"))), e[To] = So(i);
		let a = r || i.props && i.props.type === "number";
		oo(e, t ? "change" : "input", (t) => {
			t.target.composing || e[To](Do(e.value, n, a));
		}), (n || a) && oo(e, "change", () => {
			e.value = Do(e.value, n, a);
		}), t || (oo(e, "compositionstart", Co), oo(e, "compositionend", wo), oo(e, "change", wo));
	},
	mounted(e, { value: t, modifiers: { trim: n, number: r } }) {
		let i = t ?? "", a = e[Eo];
		delete e[Eo], a !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== a ? e[To](Do(e.value, n, r)) : e.value = i;
	},
	beforeUpdate(e, { value: t, oldValue: n, modifiers: { lazy: r, trim: i, number: a } }, o) {
		if (e[To] = So(o), e.composing) return;
		let s = (a || e.type === "number") && !/^0\d/.test(e.value) ? ie(e.value) : e.value, c = t ?? "";
		if (s === c) return;
		let l = e.getRootNode();
		(l instanceof Document || l instanceof ShadowRoot) && l.activeElement === e && e.type !== "range" && (r && t === n || i && e.value.trim() === c) || (e.value = c);
	}
}, Oo = {
	deep: !0,
	created(e, t, n) {
		e[To] = So(n), oo(e, "change", () => {
			let t = e._modelValue, n = No(e), r = e.checked, i = e[To];
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
			} else i(Po(e, r));
		});
	},
	mounted: ko,
	beforeUpdate(e, t, n) {
		e[To] = So(n), ko(e, t, n);
	}
};
function ko(e, { value: t, oldValue: n }, r) {
	e._modelValue = t;
	let i;
	if (d(t)) i = be(t, r.props.value) > -1;
	else if (p(t)) i = t.has(r.props.value);
	else {
		if (t === n) return;
		i = ye(t, Po(e, !0));
	}
	e.checked !== i && (e.checked = i);
}
var Ao = {
	deep: !0,
	created(e, { value: t, modifiers: { number: n } }, r) {
		e._modelValue = t, oo(e, "change", () => {
			let t = Array.prototype.filter.call(e.options, (e) => e.selected).map((e) => n ? ie(No(e)) : No(e)), r = e.multiple, i = r ? p(e._modelValue) ? new Set(t) : t : t[0], a = e._pendingValue = [r, r ? d(i) ? t.slice() : t : i];
			try {
				e[To](i);
			} finally {
				xn(() => {
					e._pendingValue === a && (e._pendingValue = void 0);
				});
			}
		}), e[To] = So(r);
	},
	mounted(e, { value: t, modifiers: { number: n } }) {
		Mo(e, t, n);
	},
	beforeUpdate(e, { value: t }, n) {
		e._modelValue = t, e[To] = So(n);
	},
	updated(e, { value: t, modifiers: { number: n } }) {
		let r = e._pendingValue;
		e._pendingValue = void 0, r && r[0] === e.multiple && jo(t, r[1], r[0]) || Mo(e, t, n);
	}
};
function jo(e, t, n) {
	if (!n || d(e)) return ye(e, t);
	if (p(e)) {
		if (e.size !== t.length) return !1;
		for (let n of t) if (!e.has(n)) return !1;
		return !0;
	}
	return !1;
}
function Mo(e, t, n = !1) {
	let r = e.multiple, i = d(t);
	if (!r || i || p(t)) {
		for (let a = 0, o = e.options.length; a < o; a++) {
			let o = e.options[a], s = No(o);
			if (r) {
				if (i) {
					let e = typeof s;
					o.selected = e === "string" || e === "number" ? t.some((e) => String(e) === String(s)) : be(t, s) > -1;
				} else o.selected = t.has(s) || n && typeof s == "string" && t.has(ie(s));
			} else if (ye(No(o), t)) {
				e.selectedIndex !== a && (e.selectedIndex = a);
				return;
			}
		}
		!r && e.selectedIndex !== -1 && (e.selectedIndex = -1);
	}
}
function No(e) {
	return "_value" in e ? e._value : e.value;
}
function Po(e, t) {
	let n = t ? "_trueValue" : "_falseValue";
	return n in e ? e[n] : t;
}
var Fo = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], Io = {
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
	exact: (e, t) => Fo.some((n) => e[`${n}Key`] && !t.includes(n))
}, Lo = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = Io[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, Ro = /* @__PURE__ */ s({ patchProp: yo }, Ua), zo;
function Bo() {
	return zo ||= Mi(Ro);
}
var Vo = ((...e) => {
	let t = Bo().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = Uo(e);
		if (!r) return;
		let i = t._component;
		h(i) || i.render || i.template || (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Ho(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function Ho(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function Uo(e) {
	return g(e) ? document.querySelector(e) : e;
}
var Wo = "scene_diary", Go = [
	"preference",
	"habit",
	"promise",
	"relationship",
	"event",
	"item_place"
], Ko = Object.freeze({
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
}), Z = (e) => Array.isArray(e) ? e : [], Q = (e) => e == null ? "" : String(e).trim(), qo = (e, t, n, r) => Math.min(n, Math.max(t, Number.isFinite(+e) ? +e : r));
function Jo(e) {
	return (typeof e == "number" || typeof e == "string" && e.trim()) && Number.isFinite(+e) ? qo(e, 0, 1, Ko.recallScoreThreshold) : Ko.recallScoreThreshold;
}
var Yo = () => Date.now();
function Xo(e = "sd") {
	return `${e}_${crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
}
function Zo() {
	return {
		timestamp: Yo(),
		timezoneOffset: (/* @__PURE__ */ new Date()).getTimezoneOffset()
	};
}
function Qo() {
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
function $o(e = {}) {
	let t = e && typeof e == "object" ? e : {};
	return {
		...Qo(),
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
function es(e = 1, t = Yo()) {
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
function ts(e = Yo()) {
	return {
		version: 6,
		currentActId: 1,
		status: "active",
		acts: [es(1, e)],
		memories: [],
		memoryRevision: 0,
		memorySpaceId: Xo("space"),
		memoryLinks: [],
		memoryOrganization: null,
		maintenanceTransaction: null,
		characterGrowth: Qo(),
		pendingTransaction: null,
		drafts: [],
		settings: structuredClone(Ko),
		lastUpdatedAt: e
	};
}
function ns(e) {
	let t = Q(e?.open), n = Q(e?.close), r = t.match(/^<([A-Za-z][A-Za-z0-9:_-]*)>$/), i = n.match(/^<\/([A-Za-z][A-Za-z0-9:_-]*)>$/);
	return r && i && r[1] === i[1] ? {
		open: t,
		close: n
	} : null;
}
var rs = (e) => Z(e).map((e) => ({
	open: `<${Q(e).replace(/^<|>$/g, "")}>`,
	close: `</${Q(e).replace(/^<|>$/g, "")}>`
})), is = (e, t) => Z(e).length ? Z(e).map(ns).filter(Boolean) : rs(t).map(ns).filter(Boolean), as = (e) => ({
	bodyTagPairs: is(e?.bodyTagPairs, e?.bodyTags),
	storyTimeTagPairs: is(e?.storyTimeTagPairs, e?.storyTimeTags),
	requiredStoryTime: !!e?.requiredStoryTime
});
function os(e = {}) {
	let { growthTargetLength: t, diaryTokenBudget: n, ...r } = e;
	return {
		...Ko,
		...r,
		recentDiaryCount: qo(e.recentDiaryCount, 0, 20, 2),
		recallMessageCount: qo(e.recallMessageCount, 1, 20, 3),
		recallLimit: qo(e.recallLimit, 0, 30, 8),
		recallScoreThreshold: Jo(e.recallScoreThreshold),
		maintenanceConnectionProfile: Q(e.maintenanceConnectionProfile),
		maintenanceCandidateLimit: Math.trunc(qo(e.maintenanceCandidateLimit, 1, 60, 20)),
		maintenanceScoreThreshold: (typeof e.maintenanceScoreThreshold == "number" || typeof e.maintenanceScoreThreshold == "string" && e.maintenanceScoreThreshold.trim()) && Number.isFinite(+e.maintenanceScoreThreshold) ? qo(e.maintenanceScoreThreshold, 0, 1, .15) : .15,
		maxGrowthChars: Ko.maxGrowthChars,
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
			user: as(e.extraction?.user || Ko.extraction.user),
			character: as(e.extraction?.character || Ko.extraction.character)
		},
		prompts: {
			diary: Q(e.prompts?.diary) || "你是 {{char}} 的恋爱陪伴日记整理器。只依据角色设定与 [本幕对话]，以第一人称写日记；不要补写事实。",
			memory: Q(e.prompts?.memory) || "你是恋爱陪伴记忆提取器。只依据 [本幕对话] 提取已发生或已明确确认的事实。承诺已经作出可以记录，但承诺内容未发生时不得写成已经完成。不要补写事实。",
			growth: Q(e.prompts?.growth) || "你是 {{char}} 的角色成长与恋爱关系发展整理器。根据 [当前角色成长] 和 [本幕对话]，重写截至本幕结束的完整角色成长记录。重点维护 {{char}} 的性格成长、情感变化、生活状态变化，以及 {{char}} 与 {{user}} 从相识至今的关系发展路径。说明重要经历如何影响角色及双方关系，但不要逐条复述剧情，不要补写未发生或未确认的变化，也不要假定下一幕与本幕在时间、地点或事件上连续。",
			maintenance: Q(e.prompts?.maintenance) || "你是记忆库语义整理器。素材只有提供的已保存记忆及关联，不读取或补写外部事实。寻找同一事实的重复表达并建议合并；不同时间分别成立、发展、兑现、取消的事实保持独立并建议关联。仅人物或地点相同不足以关联。所有结果只是供用户批准的建议。"
		}
	};
}
function ss(e = {}) {
	let { sources: t, sourceActId: n, sourceMessageIds: r, lifecycle: i, supersedes: a, mergedInto: o, revision: s, status: c, dirty: l, reviewRecommended: u, sourceFingerprint: d, accepted: f, disabled: p, ...m } = e, h = Zo();
	return {
		...m,
		id: Q(e.id) || Xo("memory"),
		category: Go.includes(e.category) ? e.category : "event",
		title: Q(e.title).slice(0, 120),
		content: Q(e.content),
		people: [...new Set(Z(e.people).map(Q).filter(Boolean))],
		aliases: [...new Set(Z(e.aliases).map(Q).filter(Boolean))],
		importance: Math.round(qo(e.importance, 1, 5, 3)),
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
function cs(e, t) {
	let n = new Set(t.filter((e) => !e.deletedAt).map((e) => e.id)), r = /* @__PURE__ */ new Set();
	return Z(e).flatMap((e) => {
		let [t, i] = [Q(e?.a), Q(e?.b)].sort(), a = JSON.stringify([t, i]);
		return !t || t === i || !n.has(t) || !n.has(i) || r.has(a) ? [] : (r.add(a), [{
			a: t,
			b: i,
			reason: Q(e.reason).slice(0, 300)
		}]);
	});
}
function ls(e, t) {
	if (e?.version !== 1 || !Number.isFinite(e.initializedAt) || e.initializedAt <= 0 || !e.reviewed || typeof e.reviewed != "object" || Array.isArray(e.reviewed)) return null;
	let n = Object.fromEntries(t.filter((t) => Object.hasOwn(e.reviewed, t.id) && typeof e.reviewed[t.id] == "string").map((t) => [t.id, e.reviewed[t.id]]));
	return {
		version: 1,
		initializedAt: e.initializedAt,
		lastOrganizedAt: Number.isFinite(e.lastOrganizedAt) && e.lastOrganizedAt > 0 ? e.lastOrganizedAt : e.initializedAt,
		reviewed: n
	};
}
function us(e) {
	if (!e) return null;
	if (e.version === 2 || e.status === "preview" || e.status === "legacy") return e;
	let t = structuredClone(e);
	return t.version !== 2 && t.status !== "preview" && (t.status = "legacy", t.error = "旧版未完成整理需要重新发起；可查看已完成批次或取消。"), t;
}
function ds(e) {
	let t = ts(), n = e && typeof e == "object" ? e : {}, r = Number.isFinite(+n.version) ? +n.version : 0;
	if (r > 6) throw Error(`聊天数据版本 ${n.version} 高于支持版本 6`);
	let { maintenanceHistory: i, ...a } = n, o = Z(n.acts).map((e, t) => ({
		...es(+e?.id || t + 1, +e?.createdAt || Yo()),
		...e,
		id: +e?.id || t + 1,
		messageIds: Z(e?.messageIds).map(String),
		status: [
			"active",
			"closing",
			"closed"
		].includes(e?.status) ? e.status : "active"
	})), s = o.length ? o : t.acts, c = s.some((e) => e.id === +n.currentActId) ? +n.currentActId : s.at(-1).id, l = Z(n.memories).filter((e) => e && !e.deletedAt && !["archived", "superseded"].includes(e.lifecycle)).map(ss), u = n.pendingTransaction ? structuredClone(n.pendingTransaction) : null;
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
		memoryLinks: cs(n.memoryLinks, l),
		memoryOrganization: r < 5 ? null : ls(n.memoryOrganization, l),
		memoryRevision: +n.memoryRevision || 0,
		memorySpaceId: Q(n.memorySpaceId) || t.memorySpaceId,
		pendingTransaction: u,
		maintenanceTransaction: r < 5 ? null : us(n.maintenanceTransaction),
		characterGrowth: $o(n.characterGrowth && typeof n.characterGrowth == "object" ? n.characterGrowth : n.summary),
		settings: os(n.settings),
		drafts: Z(n.drafts)
	};
}
var fs = (e) => Z(e?.acts).find((t) => t.id === e.currentActId) || Z(e?.acts).at(-1) || null, ps = (e, t) => Z(e?.acts).find((e) => e.id === +t) || null;
function ms(e) {
	let t = 2166136261;
	for (let n of String(e ?? "")) t ^= n.charCodeAt(0), t = Math.imul(t, 16777619);
	return (t >>> 0).toString(16);
}
function hs(e) {
	return ms(Z(e).map((e) => `${e?.extra?.scene_diary?.messageId || ""}:${e?.mes || ""}`).join("\n"));
}
function gs(e, t, n = null) {
	e.extra ||= {}, e.extra.scene_diary ||= {};
	let r = e.extra.scene_diary;
	return r.messageId ||= Xo("msg"), t != null && (r.actId = +t), n != null && (r.messageIndex = +n), r;
}
function _s(e) {
	return !!e && !e.is_system && e.extra?.type !== "narrator" && !e.extra?.tool_invocations && !e.extra?.scene_diary?.injected && !e.is_hidden;
}
function vs(e, t, n, r = null) {
	let i = gs(t, n, r).messageId, a = ps(e, n);
	return a && !a.messageIds.includes(i) && a.messageIds.push(i), i;
}
function ys(e, t, n = null) {
	let r = fs(e), i = es(Math.max(...e.acts.map((e) => e.id), 0) + 1);
	return i.startMessageIndex = n, e.acts.push(i), e.currentActId = i.id, e.status = "active", r && (r.status = "closed"), t && vs(e, t, i.id, n), i;
}
function bs(e, t) {
	return Z(e).filter((e) => !_s(e) || +e.extra?.scene_diary?.actId == +t);
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
	return is(e?.[t], e?.[n]);
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
	for (let o of Z(e)) {
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
	for (let i of Z(e)) {
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
var Os = (e) => Math.ceil(String(e || "").length / 2);
function ks(e) {
	let t = String(e || "").toLocaleLowerCase(), n = [];
	try {
		if (Intl.Segmenter) for (let e of new Intl.Segmenter("zh", { granularity: "word" }).segment(t)) e.isWordLike && e.segment.trim() && n.push(e.segment);
	} catch {}
	for (let e of t.match(/[\u4e00-\u9fff]{2,}/g) || []) for (let t = 0; t < e.length - 1; t++) n.push(e.slice(t, t + 2));
	return [.../* @__PURE__ */ new Set([...n, ...t.split(/[^\p{L}\p{N}_-]+/u).filter((e) => e.length > 1)])];
}
var As = (e) => `${e.content}${e.storyTime ? `（故事时间：${e.storyTime}）` : ""}`;
function js(e, t) {
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
var Ms = (e) => String(e ?? "").trim(), Ns = (e) => e && !e.deletedAt, Ps = (e) => Ms(e.content), Fs = /* @__PURE__ */ new Map();
function Is(e, t) {
	let n = `${t}:${ms(e.map((e) => `${e.id}\u0000${Ps(e)}`).join(""))}`;
	if (Fs.has(n)) return Fs.get(n);
	let r = e.map((e) => {
		let t = ks(Ps(e)), n = /* @__PURE__ */ new Map();
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
	return Fs.set(n, a), Fs.size > 3 && Fs.delete(Fs.keys().next().value), a;
}
function Ls(e, t = e.map((e) => e.relevanceScore ?? e.score), { absolute: n = !1, useImportance: r = !0 } = {}) {
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
var Rs = (e, t) => {
	if (!e || !t || e.length !== t.length) return 0;
	let n = 0, r = 0, i = 0;
	for (let a = 0; a < e.length; a++) n += e[a] * t[a], r += e[a] ** 2, i += t[a] ** 2;
	return r && i ? n / Math.sqrt(r * i) : 0;
};
function zs(e, t = null, { includePermanent: n = !1 } = {}) {
	let r = e.filter((e) => Ns(e) && (n || !e.permanent)), i = Is(r, t);
	return (e, { vectors: t = /* @__PURE__ */ new Map(), queryVector: n = null, excludeId: a = null, useImportance: o = !0 } = {}) => {
		let s = ks(e), c = i.docs.filter((e) => e.memory.id !== a).map((t) => {
			let n = s.filter((e) => t.tf.has(e)), a = Ms(t.memory.content) && e.toLowerCase().includes(Ms(t.memory.content).toLowerCase()), o = n.reduce((e, n) => {
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
			let r = Rs(n, t.get(e.id));
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
		return Ls([...u.values()], void 0, { useImportance: o });
	};
}
// semantic.js
var Bs = "scene_diary_vectors_v1", Vs = "vectors", Hs = () => new Promise((e, t) => {
	let n = indexedDB.open(Bs, 1);
	n.onupgradeneeded = () => n.result.createObjectStore(Vs), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error);
}), Us = (e, t, n) => [
	"content-only-v1",
	e.account,
	e.chat,
	e.space,
	t.endpoint,
	t.model,
	t.dimensions || "",
	n.id,
	ms(Ps(n))
].join("|");
function Ws(e, t = "向量") {
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
function Gs(e, t = []) {
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
async function Ks(e, t, n) {
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
		throw Error(Gs(`${t}服务返回 HTTP ${e.status}${a ? `（${a}）` : ""}${i ? `：${i}` : ""}`, [n]));
	}
	try {
		return await e.json();
	} catch (e) {
		throw e?.name === "AbortError" ? e : Error(`${t}响应不是有效 JSON：${Gs(e, [n])}`);
	}
}
async function qs(e, t, n, r, { signal: i } = {}) {
	let a = Ws(n.rerankEndpoint, "重排");
	if (!n.rerankModel) throw Error("未设置重排模型");
	if (!t.length) return [];
	let o = (await Ks(await fetch(a, {
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
async function Js(e, t, n, { signal: r } = {}) {
	let i = Ws(t.endpoint);
	if (!t.model) throw Error("未设置向量模型");
	let a = await Ks(await fetch(i, {
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
async function Ys(e, t, n) {
	if (!e.length) return /* @__PURE__ */ new Map();
	let r = await Hs();
	try {
		let i = r.transaction(Vs).objectStore(Vs), a = await Promise.all(e.map((e) => new Promise((r, a) => {
			let o = i.get(Us(t, n, e));
			o.onsuccess = () => r([e.id, o.result]), o.onerror = () => a(o.error);
		})));
		return new Map(a.filter(([, e]) => Array.isArray(e)));
	} finally {
		r.close();
	}
}
async function Xs(e, t, n, r) {
	let i = await Hs();
	try {
		await new Promise((a, o) => {
			let s = i.transaction(Vs, "readwrite"), c = s.objectStore(Vs);
			s.oncomplete = a, s.onerror = s.onabort = () => o(s.error || /* @__PURE__ */ Error("向量缓存写入中止")), e.forEach((e, i) => c.put(t[i], Us(n, r, e)));
		});
	} finally {
		i.close();
	}
}
// src/workspace.ts
function Zs(e) {
	let t = /* @__PURE__ */ qt(e.snapshot()), n = /* @__PURE__ */ R(!1), r = /* @__PURE__ */ R(!1), i = /* @__PURE__ */ R("workbench"), a = /* @__PURE__ */ R(""), o = /* @__PURE__ */ R(""), s = t.value.chatId;
	e.subscribe((e) => {
		t.value = e, Xt(t), e.chatId !== s && (s = e.chatId, i.value = "workbench", a.value = "", o.value = "");
	});
	async function c(n) {
		a.value = "", o.value = "";
		let r = s;
		try {
			return await n();
		} catch (n) {
			if (r === s && n?.name !== "AbortError" && !t.value.saveError) {
				let r = t.value.channels.map((e) => e.key), i = e.getContext().accountStorage;
				a.value = Gs(n, [
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
			i.value = "workbench", n.value = !0, xn(() => document.getElementById("sd-title")?.focus());
		},
		select: (e) => {
			i.value = e, a.value = "", o.value = "";
		}
	};
}
var Qs = Symbol("scene-diary"), $s = () => Rn(Qs);
function ec(e, t) {
	let n = URL.createObjectURL(new Blob([JSON.stringify(e, null, 2)], { type: "application/json" })), r = document.createElement("a");
	r.href = n, r.download = t, r.click(), setTimeout(() => URL.revokeObjectURL(n), 1e3);
}
var tc = {
	preference: "偏好",
	npc_relationship: "NPC 关系",
	item: "重要物品",
	place: "地点"
}, nc = {
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
}, rc = {
	diary: "日记",
	growth: "成长",
	memory: "事实提取",
	summary: "日记摘要",
	graph: "图谱整理"
}, ic = [
	"diary",
	"memory",
	"growth"
], ac = (e) => !!e && !e.deletedAt && Object.hasOwn(tc, e.category) && !e.needsClassification, $ = (e) => typeof e == "string" ? e.trim() : "";
function oc(e) {
	return {
		...ss(e),
		category: e.category,
		needsClassification: !Object.hasOwn(tc, e.category)
	};
}
function sc(e) {
	return {
		id: e.id || Xo("diary"),
		title: $(e.title) || "未命名日记",
		body: typeof e.body == "string" ? e.body : "",
		summary: $(e.summary),
		summaryPending: !!e.summaryPending || !$(e.summary),
		needsReview: !!e.needsReview,
		createdAt: Number(e.createdAt) || Date.now(),
		updatedAt: Number(e.updatedAt) || Date.now()
	};
}
function cc(e = {}) {
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
function lc() {
	return {
		...uc(ts()),
		connectionSetupNeeded: !1
	};
}
function uc(e) {
	if (e.version === 7) return e;
	let t = ds(e), { memoryLinks: n, memoryOrganization: r, maintenanceTransaction: i, ...a } = t, o = t.acts.filter((e) => $(e.diary)).map((e) => sc({
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
						id: e.id || Xo("proposal"),
						action: "new",
						targetId: null,
						value: oc(e),
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
		memories: t.memories.map(oc),
		edges: [],
		graphReviewed: {},
		graphPreview: null,
		pendingTransaction: l,
		status: l ? "preview" : t.status === "pending_next_act" ? t.status : "active",
		settings: cc({
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
function dc(e, t, { actId: n = e.characterGrowth.lastIncludedActId, edited: r = !0 } = {}) {
	let i = Zo();
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
function fc(e) {
	return JSON.stringify([
		e.from,
		e.type,
		e.to
	]);
}
function pc(e, t) {
	let n = new Set(t.filter(ac).map((e) => e.id)), r = /* @__PURE__ */ new Map();
	for (let t of e || []) t && n.has(t.from) && n.has(t.to) && t.from !== t.to && Object.hasOwn(nc, t.type) && $(t.reason) && r.set(fc(t), {
		from: t.from,
		to: t.to,
		type: t.type,
		reason: $(t.reason)
	});
	return [...r.values()];
}
function mc(e) {
	return ac(e) && $(e.title) && $(e.content) && Number.isInteger(e.importance) && e.importance >= 1 && e.importance <= 5;
}
function hc(e, t, n = null) {
	let r = e.memories.find((e) => e.id === n);
	if (n && !r) throw Error("事实已删除，请重新选择。");
	if (r?.locked) throw Error("请先解锁这条事实。");
	let i = oc({
		...r,
		...t,
		id: r?.id || Xo("fact"),
		updatedAt: Date.now()
	});
	if (!mc(i)) throw Error("请选择类别，填写标题与正文，并设置 1–5 的重要度。");
	return r ? e.memories[e.memories.indexOf(r)] = i : e.memories.push(i), e.memoryRevision++, i;
}
function gc(e, t) {
	if (e.memories.find((e) => e.id === t)?.locked) throw Error("请先解锁这条事实。");
	e.memories = e.memories.filter((e) => e.id !== t), e.edges = pc(e.edges, e.memories), delete e.graphReviewed[t], e.memoryRevision++;
}
function _c(e, t, n, r) {
	let i = e.memories.find((e) => e.id === t), a = [...new Set(n)].filter((e) => e !== t).map((t) => e.memories.find((e) => e.id === t));
	if (!ac(i) || !a.length || a.some((e) => !ac(e) || e.locked) || i.locked) throw Error("请选择有效且已解锁的事实。");
	let o = [i, ...a], s = [...new Set(o.map((e) => e.storyTime).filter(Boolean))];
	if (s.length > 1) throw Error("故事时间不同，请先在事实编辑器中核对。");
	hc(e, {
		content: r,
		permanent: o.some((e) => e.permanent),
		importance: Math.max(...o.map((e) => e.importance)),
		storyTime: s[0] || null,
		people: o.flatMap((e) => e.people),
		aliases: o.flatMap((e) => e.aliases)
	}, t);
	let c = new Set(a.map((e) => e.id));
	e.memories = e.memories.filter((e) => !c.has(e.id)), e.edges = pc(e.edges.map((e) => ({
		...e,
		from: c.has(e.from) ? t : e.from,
		to: c.has(e.to) ? t : e.to
	})), e.memories);
	for (let t of c) delete e.graphReviewed[t];
}
function vc(e, t) {
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
function yc(e, t, n) {
	if (t?.format !== "scene-diary-content" || ![2, 3].includes(t.version) || String(n) !== t.chatId) throw Error("备份格式、版本或聊天身份不匹配。");
	if (!Array.isArray(t.diaries) || !Array.isArray(t.memories) || typeof t.characterGrowth?.content != "string") throw Error("备份缺少必需字段。");
	let r = t.version === 2, i = (e) => e.every((e) => typeof e == "string" && e) && new Set(e).size === e.length;
	if (!i(t.diaries.map((e) => r ? Number.isInteger(e?.actId) ? String(e.actId) : "" : e?.id)) || !t.diaries.every((e) => $(r ? e?.diary : e?.body) && (r || typeof e.summary == "string")) || !i(t.memories.map((e) => e?.id)) || !t.memories.every((e) => $(e?.category) && $(e?.title) && $(e?.content))) throw Error("备份包含重复 ID 或无效条目。");
	let a = t.memories.map(oc), o = new Map(e.acts.map((e) => [e.id, e.closedAt || e.createdAt])), s = Date.parse(t.createdAt) || Date.now(), c = t.diaries.map((e, t) => sc(r ? {
		title: e.title,
		body: e.diary,
		needsReview: e.dirty,
		createdAt: o.get(e.actId) || s + t
	} : e)), l = r ? [] : pc(t.edges, a);
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
var bc = { class: "sd-field" }, xc = ["rows", "readonly"], Sc = /* @__PURE__ */ $n({
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
		return (n, r) => (U(), W("label", bc, [G("span", null, N(e.label), 1), B(G("textarea", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			rows: e.rows || 6,
			readonly: e.readonly
		}, null, 8, xc), [[X, t.value]])]));
	}
}), Cc = { class: "sd-card sd-stack" }, wc = { class: "sd-section-title" }, Tc = { class: "sd-pill" }, Ec = {
	key: 0,
	class: "sd-alert"
}, Dc = { key: 1 }, Oc = { key: 2 }, kc = { class: "sd-field" }, Ac = {
	key: 0,
	class: "sd-compare"
}, jc = { class: "sd-field" }, Mc = ["value"], Nc = { key: 0 }, Pc = { class: "sd-stack" }, Fc = { key: 0 }, Ic = { key: 1 }, Lc = ["onUpdate:modelValue", "disabled"], Rc = { key: 0 }, zc = { class: "sd-field" }, Bc = ["onUpdate:modelValue"], Vc = ["value"], Hc = { class: "sd-field" }, Uc = ["onUpdate:modelValue"], Wc = { class: "sd-form-grid" }, Gc = { class: "sd-field" }, Kc = ["onUpdate:modelValue"], qc = { class: "sd-field" }, Jc = ["onUpdate:modelValue"], Yc = {
	key: 4,
	class: "sd-actions"
}, Xc = {
	key: 5,
	class: "sd-actions"
}, Zc = /* @__PURE__ */ $n({
	__name: "Review",
	props: {
		kind: {},
		part: {},
		transaction: {}
	},
	setup(e) {
		let t = e, { view: n, host: r, run: i, select: a } = $s(), o = /* @__PURE__ */ R(), s = () => t.kind === "diary" ? {
			title: "",
			body: "",
			summary: ""
		} : t.kind === "growth" ? {
			changed: !0,
			content: ""
		} : [];
		Hn(() => JSON.stringify(t.part.value), () => {
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
		}, u = Y(() => t.kind !== "growth" || t.transaction.results.diary.status === "confirmed"), d = Y(() => n.value.busy.includes("close:" + t.kind)), f = Y(() => n.value.channels.some((e) => e.id === n.value.state?.settings.bindings[t.kind])), p = (e) => n.value.state?.memories.find((t) => t.id === e);
		function m(e = !1, n = !0) {
			return i(() => r.reviewPart(t.kind, JSON.parse(JSON.stringify(o.value)), e, n));
		}
		return (t, s) => (U(), W("article", Cc, [
			G("header", wc, [G("h3", null, N(z(rc)[e.kind]), 1), G("span", Tc, N(c[e.part.status]), 1)]),
			e.part.error ? (U(), W("p", Ec, N(e.part.error), 1)) : J("", !0),
			e.kind === "growth" && !u.value && e.part.status !== "skipped" ? (U(), W("p", Dc, "确认日记后开始成长评估。")) : J("", !0),
			e.kind === "growth" && e.part.status === "outdated" ? (U(), W("p", Oc, "日记内容已变更。可参考旧草稿，重新评估或修订后确认。")) : J("", !0),
			u.value && !d.value ? (U(), W(H, { key: 3 }, [e.kind === "diary" ? (U(), W(H, { key: 0 }, [
				G("label", kc, [s[11] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": s[0] ||= (e) => o.value.title = e }, null, 512), [[X, o.value.title]])]),
				K(Sc, {
					modelValue: o.value.body,
					"onUpdate:modelValue": s[1] ||= (e) => o.value.body = e,
					label: "第一人称正文",
					rows: 9
				}, null, 8, ["modelValue"]),
				K(Sc, {
					modelValue: o.value.summary,
					"onUpdate:modelValue": s[2] ||= (e) => o.value.summary = e,
					label: "单篇摘要",
					rows: 4
				}, null, 8, ["modelValue"])
			], 64)) : e.kind === "growth" ? (U(), W(H, { key: 1 }, [G("label", null, [B(G("input", {
				type: "checkbox",
				"onUpdate:modelValue": s[3] ||= (e) => o.value.changed = e
			}, null, 512), [[Oo, o.value.changed]]), s[12] ||= q(" 本幕有实质变化", -1)]), o.value.changed ? (U(), W("div", Ac, [G("label", jc, [s[13] ||= q("当前画像", -1), G("textarea", {
				value: z(n).state?.characterGrowth.content,
				readonly: "",
				rows: "8"
			}, null, 8, Mc)]), K(Sc, {
				modelValue: o.value.content,
				"onUpdate:modelValue": s[4] ||= (e) => o.value.content = e,
				label: "候选画像",
				rows: 8
			}, null, 8, ["modelValue"])])) : J("", !0)], 64)) : (U(), W(H, { key: 2 }, [e.part.value && !o.value.length ? (U(), W("p", Nc, "本幕没有合格事实。")) : J("", !0), (U(!0), W(H, null, V(o.value, (e) => (U(), W("details", {
				class: "sd-subcard",
				key: e.id,
				open: ""
			}, [G("summary", null, N(l[e.action]) + " · " + N(e.value.title), 1), G("div", Pc, [
				p(e.targetId) ? (U(), W("p", Fc, [
					s[14] ||= G("strong", null, "已有事实", -1),
					s[15] ||= G("br", null, null, -1),
					q(N(p(e.targetId).content), 1)
				])) : J("", !0),
				e.action === "duplicate" ? J("", !0) : (U(), W("label", Ic, [
					B(G("input", {
						type: "checkbox",
						"onUpdate:modelValue": (t) => e.accepted = t,
						disabled: p(e.targetId)?.locked
					}, null, 8, Lc), [[Oo, e.accepted]]),
					s[16] ||= q(" 接受这条建议", -1),
					p(e.targetId)?.locked ? (U(), W("span", Rc, "（目标已锁定）")) : J("", !0)
				])),
				G("label", zc, [s[18] ||= q("类别", -1), B(G("select", { "onUpdate:modelValue": (t) => e.value.category = t }, [s[17] ||= G("option", {
					disabled: "",
					value: ""
				}, "请选择", -1), (U(!0), W(H, null, V(z(tc), (e, t) => (U(), W("option", {
					key: t,
					value: t
				}, N(e), 9, Vc))), 128))], 8, Bc), [[Ao, e.value.category]])]),
				G("label", Hc, [s[19] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": (t) => e.value.title = t }, null, 8, Uc), [[X, e.value.title]])]),
				K(Sc, {
					modelValue: e.value.content,
					"onUpdate:modelValue": (t) => e.value.content = t,
					label: "拟保存内容",
					rows: 3
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				G("div", Wc, [G("label", Gc, [s[20] ||= q("故事时间", -1), B(G("input", { "onUpdate:modelValue": (t) => e.value.storyTime = t }, null, 8, Kc), [[X, e.value.storyTime]])]), G("label", qc, [s[21] ||= q("重要度", -1), B(G("input", {
					type: "number",
					"onUpdate:modelValue": (t) => e.value.importance = t,
					min: "1",
					max: "5"
				}, null, 8, Jc), [[
					X,
					e.value.importance,
					void 0,
					{ number: !0 }
				]])])])
			])]))), 128))], 64))], 64)) : J("", !0),
			d.value ? (U(), W("div", Yc, [G("button", { onClick: s[5] ||= (t) => z(r).cancel("close:" + e.kind) }, "取消本项请求")])) : u.value ? (U(), W("div", Xc, [
				f.value ? (U(), W("button", {
					key: 0,
					onClick: s[6] ||= (t) => z(i)(() => z(r).runClose(e.kind))
				}, N(e.part.status === "idle" ? "生成" : "重新生成"), 1)) : (U(), W("button", {
					key: 1,
					onClick: s[7] ||= (e) => z(a)("settings")
				}, "配置渠道")),
				e.kind !== "memory" || e.part.value ? (U(), W("button", {
					key: 2,
					onClick: s[8] ||= (e) => m(!1, !1)
				}, "保存草稿")) : J("", !0),
				e.kind !== "memory" || e.part.value ? (U(), W("button", {
					key: 3,
					class: "sd-primary",
					onClick: s[9] ||= (e) => m()
				}, "确认" + N(z(rc)[e.kind]), 1)) : J("", !0),
				G("button", { onClick: s[10] ||= (e) => m(!0) }, N(e.kind === "diary" ? "跳过日记和成长评估" : "跳过本项"), 1)
			])) : J("", !0)
		]));
	}
}), Qc = {
	key: 0,
	class: "sd-card sd-stack"
}, $c = ["max"], el = { class: "sd-hero sd-card" }, tl = { class: "sd-kicker" }, nl = { key: 0 }, rl = { key: 1 }, il = { key: 0 }, al = ["disabled"], ol = {
	key: 0,
	class: "sd-status"
}, sl = {
	key: 1,
	id: "sd-close-review",
	class: "sd-stack"
}, cl = { class: "sd-sticky sd-actions" }, ll = ["disabled"], ul = { class: "sd-card" }, dl = { class: "sd-actions" }, fl = { class: "sd-file" }, pl = /* @__PURE__ */ $n({
	__name: "Workbench",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = $s(), a = /* @__PURE__ */ R(1), o = Y(() => t.value.state), s = Y(() => fs(o.value)), c = Y(() => o.value?.pendingTransaction), l = Y(() => ic.every((e) => ["confirmed", "skipped"].includes(c.value?.results[e]?.status))), u = () => document.getElementById("sd-close-review")?.scrollIntoView({ block: "start" }), d = (e) => window.confirm(e), f = (e) => t.value.channels.some((t) => t.id === o.value?.settings.bindings[e]);
		return (e, p) => o.value ? (U(), W(H, { key: 1 }, [
			G("header", el, [G("div", null, [
				G("p", tl, "第 " + N(s.value?.id) + " 幕", 1),
				G("h3", null, N(c.value ? "本幕待审核" : o.value.status === "pending_next_act" ? "本幕已归档" : "当前幕"), 1),
				G("p", null, [
					q(N(s.value?.messageIds.length || 0) + " 条归幕对话", 1),
					s.value?.startMessageIndex == null ? J("", !0) : (U(), W("span", nl, " · 起始楼层 " + N(s.value.startMessageIndex + 1), 1)),
					s.value?.endMessageIndex == null ? J("", !0) : (U(), W("span", rl, " · 结束楼层 " + N(s.value.endMessageIndex + 1), 1))
				]),
				o.value.status === "pending_next_act" ? (U(), W("p", il, "下一条玩家消息将开启新幕。")) : J("", !0)
			]), !c.value && o.value.status === "active" ? (U(), W("button", {
				key: 0,
				class: "sd-primary",
				disabled: !s.value?.messageIds.length,
				onClick: p[3] ||= (e) => z(r)(z(n).openClose)
			}, "结束这一幕", 8, al)) : c.value ? (U(), W("button", {
				key: 1,
				class: "sd-primary",
				onClick: u
			}, "继续审核")) : (U(), W("button", {
				key: 2,
				onClick: p[4] ||= (e) => z(i)("diaries")
			}, "查看日记档案"))]),
			o.value.connectionSetupNeeded && [
				"diary",
				"memory",
				"growth",
				"summary",
				"graph"
			].some((e) => !f(e)) ? (U(), W("p", ol, [p[13] ||= q(" 旧版连接已停用。请为尚未绑定的日记、成长、事实提取、日记摘要和图谱任务配置自建渠道。 ", -1), G("button", { onClick: p[5] ||= (e) => z(i)("settings") }, "打开设置")])) : J("", !0),
			c.value ? (U(), W("section", sl, [(U(!0), W(H, null, V(z(ic), (e) => (U(), ea(Zc, {
				key: c.value.id + e,
				kind: e,
				part: c.value.results[e],
				transaction: c.value
			}, null, 8, [
				"kind",
				"part",
				"transaction"
			]))), 128)), G("div", cl, [G("button", { onClick: p[6] ||= (e) => z(r)(() => d("取消这次关幕并清除本次审核草稿？") && z(n).cancelClose()) }, "取消关幕"), G("button", {
				class: "sd-primary",
				disabled: !l.value,
				onClick: p[7] ||= (e) => z(r)(z(n).confirmClose)
			}, "确认结束本幕", 8, ll)])])) : J("", !0),
			G("details", ul, [p[15] ||= G("summary", null, "备份与恢复", -1), G("div", dl, [
				G("button", { onClick: p[8] ||= (e) => z(r)(() => z(ec)(z(n).backup(), "scene-diary-" + z(t).chatId + ".json")) }, "导出内容"),
				G("label", fl, [p[14] ||= q("导入内容 ", -1), G("input", {
					type: "file",
					accept: ".json,application/json",
					onChange: p[9] ||= (e) => z(r)(async () => {
						let t = e.target, r = t.files?.[0];
						if (t.value = "", !r) return;
						let i = JSON.parse(await r.text()), a = i.version === 2 ? "请保留原 v2 文件以便查阅旧关联。确认替换当前日记、成长与事实？" : "确认替换当前日记、成长、事实与图谱？";
						d(a) && await z(n).import(i);
					})
				}, null, 32)]),
				G("button", { onClick: p[10] ||= (e) => z(r)(async () => z(ec)(await z(n).migrationBackup(), "scene-diary-pre-upgrade-" + z(t).chatId + ".json")) }, "导出升级前整聊天备份")
			])])
		], 64)) : (U(), W("div", Qc, [
			G("p", null, N(z(t).blocker), 1),
			z(t).blocker.startsWith("已有聊天") ? (U(), W("form", {
				key: 0,
				class: "sd-actions",
				onSubmit: p[1] ||= Lo((e) => z(r)(() => z(n).takeOver(a.value - 1)), ["prevent"])
			}, [G("label", null, [p[11] ||= q("从楼层 ", -1), B(G("input", {
				"onUpdate:modelValue": p[0] ||= (e) => a.value = e,
				type: "number",
				min: "1",
				max: Math.max(z(t).messages, 1),
				required: ""
			}, null, 8, $c), [[
				X,
				a.value,
				void 0,
				{ number: !0 }
			]])]), p[12] ||= G("button", { class: "sd-primary" }, "接管聊天", -1)], 32)) : J("", !0),
			z(t).blocker.startsWith("迁移备份失败") ? (U(), W("button", {
				key: 1,
				onClick: p[2] ||= (e) => z(r)(z(n).initialize)
			}, "重试迁移")) : J("", !0)
		]));
	}
}), ml = {
	key: 0,
	class: "sd-card"
}, hl = { class: "sd-card sd-stack" }, gl = {
	key: 0,
	class: "sd-status"
}, _l = { class: "sd-sticky sd-actions" }, vl = { class: "sd-card sd-stack" }, yl = {
	key: 0,
	role: "status"
}, bl = {
	key: 1,
	class: "sd-compare"
}, xl = { class: "sd-field" }, Sl = ["value"], Cl = { class: "sd-actions" }, wl = /* @__PURE__ */ $n({
	__name: "Growth",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = $s(), a = Y(() => t.value.state?.characterGrowth), o = /* @__PURE__ */ R(""), s = /* @__PURE__ */ R("");
		return Hn(() => a.value?.revision, () => o.value = a.value?.content || "", { immediate: !0 }), Hn(() => t.value.growthPreview, (e) => s.value = e?.content || "", { immediate: !0 }), (e, c) => a.value ? (U(), W(H, { key: 1 }, [G("section", hl, [
			c[8] ||= G("header", { class: "sd-section-title" }, [G("h3", null, "当前角色画像")], -1),
			a.value.reviewRecommended ? (U(), W("p", gl, "历史材料有变更，可核对现画像或发起重整。")) : J("", !0),
			K(Sc, {
				modelValue: o.value,
				"onUpdate:modelValue": c[0] ||= (e) => o.value = e,
				label: "人格、关系与当前状态",
				rows: 12
			}, null, 8, ["modelValue"]),
			G("div", _l, [G("button", {
				class: "sd-primary",
				onClick: c[1] ||= (e) => z(r)(() => z(n).mutate((e) => z(dc)(e, o.value)))
			}, "保存画像")])
		]), G("section", vl, [
			c[10] ||= G("header", { class: "sd-section-title" }, [G("h3", null, "全局成长重整")], -1),
			z(t).growthProgress ? (U(), W("p", yl, N(z(t).growthProgress), 1)) : J("", !0),
			z(t).growthPreview ? (U(), W("div", bl, [G("label", xl, [c[9] ||= q("现画像", -1), G("textarea", {
				value: a.value.content,
				rows: "10",
				readonly: ""
			}, null, 8, Sl)]), K(Sc, {
				modelValue: s.value,
				"onUpdate:modelValue": c[2] ||= (e) => s.value = e,
				label: "重整后画像",
				rows: 10
			}, null, 8, ["modelValue"])])) : J("", !0),
			G("div", Cl, [z(t).busy.includes("growth") ? (U(), W("button", {
				key: 0,
				onClick: c[3] ||= (e) => z(n).cancel("growth")
			}, "取消重整")) : z(t).growthPreview ? (U(), W(H, { key: 1 }, [G("button", { onClick: c[4] ||= (...e) => z(n).discardGrowth && z(n).discardGrowth(...e) }, "保留现稿"), G("button", {
				class: "sd-primary",
				onClick: c[5] ||= (e) => z(r)(() => z(n).acceptGrowth(s.value))
			}, "应用候选画像")], 64)) : z(t).channels.some((e) => e.id === z(t).state?.settings.bindings.growth) ? (U(), W("button", {
				key: 2,
				onClick: c[6] ||= (e) => z(r)(z(n).generateGrowth)
			}, "根据全部有效日记重整")) : (U(), W("button", {
				key: 3,
				onClick: c[7] ||= (e) => z(i)("settings")
			}, "配置成长渠道"))])
		])], 64)) : (U(), W("p", ml, N(z(t).blocker), 1));
	}
}), Tl = { class: "sd-search" }, El = ["aria-label", "placeholder"], Dl = /* @__PURE__ */ $n({
	__name: "SearchField",
	props: /*@__PURE__*/ Nr({ label: {} }, {
		modelValue: {},
		modelModifiers: {}
	}),
	emits: ["update:modelValue"],
	setup(e) {
		let t = $r(e, "modelValue");
		return (n, r) => (U(), W("label", Tl, [r[1] ||= G("i", {
			class: "fa-solid fa-magnifying-glass",
			"aria-hidden": "true"
		}, null, -1), B(G("input", {
			"onUpdate:modelValue": r[0] ||= (e) => t.value = e,
			type: "search",
			"aria-label": e.label,
			placeholder: e.label
		}, null, 8, El), [[X, t.value]])]));
	}
}), Ol = {
	key: 0,
	class: "sd-card"
}, kl = { class: "sd-card sd-stack" }, Al = { class: "sd-actions" }, jl = {
	key: 0,
	role: "status"
}, Ml = {
	key: 0,
	class: "sd-card sd-stack"
}, Nl = { class: "sd-section-title" }, Pl = { class: "sd-field" }, Fl = { class: "sd-sticky sd-actions" }, Il = {
	key: 1,
	class: "sd-card"
}, Ll = { key: 0 }, Rl = { key: 1 }, zl = { class: "sd-snippet" }, Bl = ["onClick"], Vl = /* @__PURE__ */ $n({
	__name: "Diaries",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = $s(), a = /* @__PURE__ */ R(""), o = Y(() => t.value.state), s = /* @__PURE__ */ R(null), c = /* @__PURE__ */ R(null), l = Y(() => [...o.value?.diaries || []].sort((e, t) => t.createdAt - e.createdAt)), u = Y(() => l.value.filter((e) => e.summaryPending).map((e) => e.id)), d = Y(() => l.value.filter((e) => (e.title + "\n" + e.body + "\n" + e.summary).toLowerCase().includes(a.value.trim().toLowerCase()))), f = Y(() => l.value.find((e) => e.id === s.value));
		Hn(() => f.value?.updatedAt, () => {
			f.value && (c.value = { ...f.value });
		}, { immediate: !0 });
		function p(e = null) {
			s.value = e?.id || null, c.value = e ? { ...e } : sc({
				body: "",
				summary: "",
				title: ""
			});
		}
		function m(e = !1) {
			return r(async () => {
				if (!$(c.value.body)) throw Error("请填写日记正文。");
				if (e && !$(c.value.summary)) throw Error("请先填写摘要。");
				let t = f.value, r = e ? !1 : t ? t.body !== c.value.body || t.summaryPending : !$(c.value.summary), i = sc({
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
			G("div", kl, [
				K(Dl, {
					modelValue: a.value,
					"onUpdate:modelValue": l[0] ||= (e) => a.value = e,
					label: "搜索日记标题、正文与摘要"
				}, null, 8, ["modelValue"]),
				G("div", Al, [G("button", {
					class: "sd-primary",
					onClick: l[1] ||= (e) => p()
				}, "新建日记"), z(t).busy.includes("summary") ? (U(), W("button", {
					key: 0,
					onClick: l[2] ||= (e) => z(n).cancel("summary")
				}, "取消摘要任务")) : u.value.length && z(t).channels.some((e) => e.id === o.value.settings.bindings.summary) ? (U(), W("button", {
					key: 1,
					onClick: l[3] ||= (e) => z(r)(() => z(n).summarizeAll(u.value))
				}, "补全 " + N(u.value.length) + " 篇摘要", 1)) : u.value.length ? (U(), W("button", {
					key: 2,
					onClick: l[4] ||= (e) => z(i)("settings")
				}, "配置摘要渠道")) : J("", !0)]),
				z(t).summaryProgress ? (U(), W("p", jl, N(z(t).summaryProgress), 1)) : J("", !0)
			]),
			c.value ? (U(), W("section", Ml, [
				G("header", Nl, [G("h3", null, N(f.value ? "编辑日记" : "新建日记"), 1), G("button", { onClick: l[5] ||= (e) => {
					c.value = null, s.value = null;
				} }, "关闭编辑")]),
				G("label", Pl, [l[12] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": l[6] ||= (e) => c.value.title = e }, null, 512), [[X, c.value.title]])]),
				K(Sc, {
					modelValue: c.value.body,
					"onUpdate:modelValue": l[7] ||= (e) => c.value.body = e,
					label: "正文",
					rows: 12
				}, null, 8, ["modelValue"]),
				K(Sc, {
					modelValue: c.value.summary,
					"onUpdate:modelValue": l[8] ||= (e) => c.value.summary = e,
					label: f.value?.summaryPending ? "摘要 · 待核对" : "单篇摘要",
					rows: 5
				}, null, 8, ["modelValue", "label"]),
				G("div", Fl, [
					f.value ? (U(), W("button", {
						key: 0,
						class: "sd-danger",
						onClick: h
					}, "删除")) : J("", !0),
					f.value && !z(t).busy.includes("summary") ? (U(), W("button", {
						key: 1,
						onClick: l[9] ||= (e) => z(r)(() => z(n).summarizeAll([f.value.id]))
					}, "重生成摘要")) : J("", !0),
					G("button", { onClick: l[10] ||= (e) => m() }, "保存日记"),
					G("button", {
						class: "sd-primary",
						onClick: l[11] ||= (e) => m(!0)
					}, "保存并确认摘要")
				])
			])) : J("", !0),
			d.value.length ? J("", !0) : (U(), W("p", Il, "没有符合条件的日记。")),
			(U(!0), W(H, null, V(d.value, (e) => (U(), W("article", {
				key: e.id,
				class: "sd-card sd-listrow"
			}, [G("div", null, [
				G("h3", null, N(e.title), 1),
				G("p", null, [
					q(N(new Date(e.createdAt).toLocaleDateString()), 1),
					e.summaryPending ? (U(), W("span", Ll, " · 摘要待核对")) : J("", !0),
					e.needsReview ? (U(), W("span", Rl, " · 日记待复核")) : J("", !0)
				]),
				G("p", zl, N(e.summary || e.body), 1)
			]), G("button", { onClick: (t) => p(e) }, "查看与编辑", 8, Bl)]))), 128))
		], 64)) : (U(), W("p", Ol, N(z(t).blocker), 1));
	}
}), Hl = {
	key: 0,
	class: "sd-card"
}, Ul = {
	class: "sd-segments",
	"aria-label": "长期记忆视图"
}, Wl = ["aria-pressed"], Gl = ["aria-pressed"], Kl = ["aria-pressed"], ql = { class: "sd-card sd-stack" }, Jl = { key: 0 }, Yl = {
	key: 1,
	class: "sd-actions"
}, Xl = {
	key: 0,
	class: "sd-card sd-stack"
}, Zl = { class: "sd-section-title" }, Ql = ["disabled"], $l = { class: "sd-form-grid" }, eu = { class: "sd-field" }, tu = ["value"], nu = ["value"], ru = { class: "sd-field" }, iu = { class: "sd-field" }, au = { class: "sd-form-grid" }, ou = { class: "sd-field" }, su = { class: "sd-field" }, cu = { class: "sd-field" }, lu = { class: "sd-sticky sd-actions" }, uu = ["disabled"], du = {
	key: 1,
	class: "sd-card"
}, fu = { class: "sd-stack" }, pu = { key: 0 }, mu = { key: 1 }, hu = { class: "sd-actions" }, gu = ["onClick"], _u = ["onClick"], vu = { class: "sd-card sd-stack" }, yu = { class: "sd-section-title" }, bu = { class: "sd-field" }, xu = ["value"], Su = {
	key: 0,
	class: "sd-graph"
}, Cu = { class: "sd-node" }, wu = { class: "sd-branches" }, Tu = { key: 0 }, Eu = ["onClick"], Du = ["onClick"], Ou = {
	key: 1,
	class: "sd-actions"
}, ku = {
	key: 2,
	class: "sd-subcard sd-stack"
}, Au = { class: "sd-field" }, ju = ["value"], Mu = { key: 0 }, Nu = ["disabled"], Pu = {
	key: 3,
	class: "sd-subcard sd-stack"
}, Fu = { class: "sd-form-grid" }, Iu = { class: "sd-field" }, Lu = ["value"], Ru = { class: "sd-field" }, zu = ["value"], Bu = { class: "sd-field" }, Vu = ["value"], Hu = { class: "sd-actions" }, Uu = { class: "sd-card sd-stack" }, Wu = {
	key: 0,
	role: "status"
}, Gu = { class: "sd-actions" }, Ku = {
	key: 1,
	class: "sd-stack"
}, qu = ["onUpdate:modelValue"], Ju = { class: "sd-actions" }, Yu = /* @__PURE__ */ $n({
	__name: "Memory",
	setup(e) {
		let { view: t, host: n, run: r, select: i } = $s(), a = Y(() => t.value.state), o = /* @__PURE__ */ R("facts"), s = /* @__PURE__ */ R(""), c = /* @__PURE__ */ R(null), l = /* @__PURE__ */ R(""), u = /* @__PURE__ */ R(null), d = /* @__PURE__ */ R(""), f = /* @__PURE__ */ R([]), p = /* @__PURE__ */ R(!1), m = /* @__PURE__ */ R(""), h = /* @__PURE__ */ R(""), g = Y(() => new Map((a.value?.memories || []).map((e) => [e.id, e]))), _ = Y(() => (a.value?.memories || []).filter(ac)), v = Y(() => (a.value?.memories || []).filter((e) => !ac(e))), y = Y(() => (o.value === "pending" ? v.value : _.value).filter((e) => [
			e.title,
			e.content,
			...e.people,
			...e.aliases
		].join("\n").toLowerCase().includes(s.value.trim().toLowerCase()))), b = Y(() => (a.value?.edges || []).filter((e) => e.from === l.value || e.to === l.value)), x = (e) => g.value.get(e)?.title || e;
		Hn(() => JSON.stringify(a.value?.graphPreview), () => {
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
				await n.mutate((n) => hc(n, {
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
		function w(e, t) {
			return r(() => n.mutate((n) => {
				let r = n.memories.find((t) => t.id === e.id);
				if (!r) throw Error("该事实已删除。");
				if (r.locked && t !== "locked") throw Error("请先解锁。");
				r[t] = !r[t], n.memoryRevision++, c.value?.id === e.id && (c.value[t] = r[t]);
			}));
		}
		function ee() {
			if (!c.value || !window.confirm("删除此事实及其相关边？")) return;
			let e = c.value.id;
			return r(async () => {
				await n.mutate((t) => gc(t, e)), c.value = null;
			});
		}
		function te(e = null) {
			u.value = e ? { ...e } : {
				from: l.value,
				to: "",
				type: "stored_at",
				reason: ""
			}, d.value = e ? fc(e) : "";
		}
		function T() {
			let e = { ...u.value };
			return r(async () => {
				await n.mutate((t) => {
					let n = t.edges.filter((e) => fc(e) !== d.value), r = pc([...n, e], t.memories);
					if (r.length !== n.length + 1) throw Error("请选择不同的事实、关系类型并填写依据，且避免重复关系。");
					t.edges = r;
				}), l.value = e.from, u.value = null;
			});
		}
		function E() {
			if (window.confirm("删除这条关系？")) return r(async () => {
				await n.mutate((e) => {
					e.edges = e.edges.filter((e) => fc(e) !== d.value);
				}), u.value = null;
			});
		}
		function D() {
			if (window.confirm("将来源事实合并到选定事实，并重定向相关边？")) return r(async () => {
				await n.mutate((e) => _c(e, l.value, [m.value], h.value)), p.value = !1;
			});
		}
		return (e, O) => a.value ? (U(), W(H, { key: 1 }, [G("nav", Ul, [
			G("button", {
				"aria-pressed": o.value === "facts",
				onClick: O[0] ||= (e) => {
					o.value = "facts", c.value = null;
				}
			}, "事实表", 8, Wl),
			G("button", {
				"aria-pressed": o.value === "pending",
				onClick: O[1] ||= (e) => {
					o.value = "pending", c.value = null;
				}
			}, "待分类" + N(v.value.length ? " · " + v.value.length : ""), 9, Gl),
			G("button", {
				"aria-pressed": o.value === "graph",
				onClick: O[2] ||= (e) => {
					o.value = "graph", c.value = null;
				}
			}, "记忆图谱", 8, Kl)
		]), o.value === "graph" ? (U(), W(H, { key: 1 }, [G("section", vu, [
			G("header", yu, [O[40] ||= G("h3", null, "节点与关系", -1), G("span", null, N(_.value.length) + " 个节点 · " + N(a.value.edges.length) + " 条边", 1)]),
			G("label", bu, [O[42] ||= q("查看事实", -1), B(G("select", {
				"onUpdate:modelValue": O[15] ||= (e) => l.value = e,
				onChange: O[16] ||= (e) => {
					u.value = null, p.value = !1;
				}
			}, [O[41] ||= G("option", { value: "" }, "请选择", -1), (U(!0), W(H, null, V(_.value, (e) => (U(), W("option", {
				key: e.id,
				value: e.id
			}, N(e.title), 9, xu))), 128))], 544), [[Ao, l.value]])]),
			g.value.has(l.value) ? (U(), W("div", Su, [G("div", Cu, [G("h3", null, N(x(l.value)), 1), G("p", null, N(g.value.get(l.value).content), 1)]), G("div", wu, [b.value.length ? J("", !0) : (U(), W("p", Tu, "该事实尚无关系。")), (U(!0), W(H, null, V(b.value, (e) => (U(), W("div", {
				key: z(fc)(e),
				class: "sd-branch"
			}, [G("button", { onClick: (t) => te(e) }, N(e.from === l.value ? "→" : "←") + " " + N(z(nc)[e.type].label), 9, Eu), G("button", {
				class: "sd-node",
				onClick: (t) => {
					l.value = e.from === l.value ? e.to : e.from, u.value = null, p.value = !1;
				}
			}, N(x(e.from === l.value ? e.to : e.from)), 9, Du)]))), 128))])])) : J("", !0),
			l.value ? (U(), W("div", Ou, [G("button", { onClick: O[17] ||= (e) => te() }, "新建关系"), G("button", { onClick: O[18] ||= (e) => {
				p.value = !p.value, m.value = "", h.value = g.value.get(l.value)?.content || "";
			} }, "合并事实")])) : J("", !0),
			p.value ? (U(), W("div", ku, [
				G("label", Au, [q("合并到 " + N(x(l.value)), 1), B(G("select", { "onUpdate:modelValue": O[19] ||= (e) => m.value = e }, [O[43] ||= G("option", { value: "" }, "选择来源事实", -1), (U(!0), W(H, null, V(_.value.filter((e) => !e.locked && e.id !== l.value), (e) => (U(), W("option", {
					key: e.id,
					value: e.id
				}, N(e.title), 9, ju))), 128))], 512), [[Ao, m.value]])]),
				m.value ? (U(), W("p", Mu, N(g.value.get(m.value)?.content), 1)) : J("", !0),
				K(Sc, {
					modelValue: h.value,
					"onUpdate:modelValue": O[20] ||= (e) => h.value = e,
					label: "合并后的正文"
				}, null, 8, ["modelValue"]),
				G("button", {
					disabled: !m.value,
					onClick: D
				}, "确认合并", 8, Nu)
			])) : J("", !0),
			u.value ? (U(), W("div", Pu, [
				G("div", Fu, [G("label", Iu, [O[45] ||= q("起点", -1), B(G("select", { "onUpdate:modelValue": O[21] ||= (e) => u.value.from = e }, [O[44] ||= G("option", { value: "" }, "请选择", -1), (U(!0), W(H, null, V(_.value, (e) => (U(), W("option", {
					key: e.id,
					value: e.id
				}, N(e.title), 9, Lu))), 128))], 512), [[Ao, u.value.from]])]), G("label", Ru, [O[47] ||= q("终点", -1), B(G("select", { "onUpdate:modelValue": O[22] ||= (e) => u.value.to = e }, [O[46] ||= G("option", { value: "" }, "请选择", -1), (U(!0), W(H, null, V(_.value, (e) => (U(), W("option", {
					key: e.id,
					value: e.id
				}, N(e.title), 9, zu))), 128))], 512), [[Ao, u.value.to]])])]),
				G("label", Bu, [O[48] ||= q("类型", -1), B(G("select", { "onUpdate:modelValue": O[23] ||= (e) => u.value.type = e }, [(U(!0), W(H, null, V(z(nc), (e, t) => (U(), W("option", {
					key: t,
					value: t
				}, N(e.label), 9, Vu))), 128))], 512), [[Ao, u.value.type]])]),
				G("p", null, N(z(nc)[u.value.type].meaning), 1),
				K(Sc, {
					modelValue: u.value.reason,
					"onUpdate:modelValue": O[24] ||= (e) => u.value.reason = e,
					label: "关系依据",
					rows: 3
				}, null, 8, ["modelValue"]),
				G("div", Hu, [
					G("button", { onClick: O[25] ||= (e) => [u.value.from, u.value.to] = [u.value.to, u.value.from] }, "交换方向"),
					d.value ? (U(), W("button", {
						key: 0,
						class: "sd-danger",
						onClick: E
					}, "删除关系")) : J("", !0),
					G("button", { onClick: O[26] ||= (e) => u.value = null }, "关闭"),
					G("button", {
						class: "sd-primary",
						onClick: T
					}, "保存关系")
				])
			])) : J("", !0)
		]), G("section", Uu, [
			O[50] ||= G("h3", null, "整理图谱", -1),
			z(t).graphProgress ? (U(), W("p", Wu, N(z(t).graphProgress), 1)) : J("", !0),
			G("div", Gu, [z(t).busy.includes("graph") ? (U(), W("button", {
				key: 0,
				onClick: O[27] ||= (e) => z(n).cancel("graph")
			}, "取消整理")) : z(t).channels.some((e) => e.id === a.value.settings.bindings.graph) ? (U(), W(H, { key: 1 }, [G("button", { onClick: O[28] ||= (e) => z(r)(() => z(n).organize("full")) }, "全量整理"), G("button", { onClick: O[29] ||= (e) => z(r)(() => z(n).organize("incremental")) }, "增量整理")], 64)) : (U(), W("button", {
				key: 2,
				onClick: O[30] ||= (e) => z(i)("settings")
			}, "配置图谱渠道"))]),
			a.value.graphPreview ? (U(), W("div", Ku, [
				G("p", null, N(a.value.graphPreview.mode === "full" ? "批准后以勾选的关系替换现有图谱。" : "批准后增加勾选的关系。"), 1),
				(U(!0), W(H, null, V(f.value, (e) => (U(), W("article", {
					key: z(fc)(e),
					class: "sd-subcard sd-stack"
				}, [
					G("label", null, [B(G("input", {
						type: "checkbox",
						"onUpdate:modelValue": (t) => e.accepted = t
					}, null, 8, qu), [[Oo, e.accepted]]), q(" " + N(x(e.from)) + " → " + N(z(nc)[e.type].label) + " → " + N(x(e.to)), 1)]),
					G("p", null, [
						q(N(g.value.get(e.from)?.content), 1),
						O[49] ||= G("br", null, null, -1),
						q(N(g.value.get(e.to)?.content), 1)
					]),
					K(Sc, {
						modelValue: e.reason,
						"onUpdate:modelValue": (t) => e.reason = t,
						label: "依据",
						rows: 2
					}, null, 8, ["modelValue", "onUpdate:modelValue"])
				]))), 128)),
				G("div", Ju, [G("button", { onClick: O[31] ||= (e) => z(r)(() => z(n).mutate((e) => {
					e.graphPreview = null;
				})) }, "取消预览"), G("button", {
					class: "sd-primary",
					onClick: O[32] ||= (e) => z(r)(() => z(n).applyGraph(JSON.parse(JSON.stringify(f.value))))
				}, "应用获批关系")])
			])) : J("", !0)
		])], 64)) : (U(), W(H, { key: 0 }, [
			G("div", ql, [K(Dl, {
				modelValue: s.value,
				"onUpdate:modelValue": O[3] ||= (e) => s.value = e,
				label: "搜索事实、人物、别名"
			}, null, 8, ["modelValue"]), o.value === "pending" ? (U(), W("p", Jl, "这些旧条目保留原文和控制属性。保存新类别后恢复召回。")) : (U(), W("div", Yl, [G("button", {
				class: "sd-primary",
				onClick: O[4] ||= (e) => S()
			}, "新增事实")]))]),
			c.value ? (U(), W("section", Xl, [
				G("header", Zl, [G("h3", null, N(c.value.id ? "编辑事实" : "新建事实"), 1), G("button", { onClick: O[5] ||= (e) => c.value = null }, "关闭编辑")]),
				G("fieldset", {
					disabled: c.value.locked,
					class: "sd-stack"
				}, [
					G("div", $l, [G("label", eu, [O[33] ||= q("类别", -1), B(G("select", { "onUpdate:modelValue": O[6] ||= (e) => c.value.category = e }, [z(tc)[c.value.category] ? J("", !0) : (U(), W("option", {
						key: 0,
						value: c.value.category
					}, "旧类别 · " + N(c.value.category), 9, tu)), (U(!0), W(H, null, V(z(tc), (e, t) => (U(), W("option", {
						key: t,
						value: t
					}, N(e), 9, nu))), 128))], 512), [[Ao, c.value.category]])]), G("label", ru, [O[34] ||= q("重要度", -1), B(G("input", {
						type: "number",
						"onUpdate:modelValue": O[7] ||= (e) => c.value.importance = e,
						min: "1",
						max: "5"
					}, null, 512), [[
						X,
						c.value.importance,
						void 0,
						{ number: !0 }
					]])])]),
					G("label", iu, [O[35] ||= q("标题", -1), B(G("input", { "onUpdate:modelValue": O[8] ||= (e) => c.value.title = e }, null, 512), [[X, c.value.title]])]),
					K(Sc, {
						modelValue: c.value.content,
						"onUpdate:modelValue": O[9] ||= (e) => c.value.content = e,
						label: "可独立理解的客观事实"
					}, null, 8, ["modelValue"]),
					G("div", au, [
						G("label", ou, [O[36] ||= q("故事时间", -1), B(G("input", { "onUpdate:modelValue": O[10] ||= (e) => c.value.storyTime = e }, null, 512), [[X, c.value.storyTime]])]),
						G("label", su, [O[37] ||= q("相关人物", -1), B(G("input", { "onUpdate:modelValue": O[11] ||= (e) => c.value.peopleText = e }, null, 512), [[X, c.value.peopleText]])]),
						G("label", cu, [O[38] ||= q("别名", -1), B(G("input", { "onUpdate:modelValue": O[12] ||= (e) => c.value.aliasesText = e }, null, 512), [[X, c.value.aliasesText]])])
					]),
					G("label", null, [B(G("input", {
						type: "checkbox",
						"onUpdate:modelValue": O[13] ||= (e) => c.value.permanent = e
					}, null, 512), [[Oo, c.value.permanent]]), O[39] ||= q(" 常驻", -1)])
				], 8, Ql),
				G("div", lu, [
					c.value.id ? (U(), W("button", {
						key: 0,
						onClick: O[14] ||= (e) => w(c.value, "locked")
					}, N(c.value.locked ? "解锁" : "锁定"), 1)) : J("", !0),
					c.value.id && !c.value.locked ? (U(), W("button", {
						key: 1,
						class: "sd-danger",
						onClick: ee
					}, "删除")) : J("", !0),
					G("button", {
						class: "sd-primary",
						disabled: c.value.locked,
						onClick: C
					}, "保存事实", 8, uu)
				])
			])) : J("", !0),
			y.value.length ? J("", !0) : (U(), W("p", du, "没有符合条件的事实。")),
			(U(!0), W(H, null, V(y.value, (e) => (U(), W("article", {
				key: e.id,
				class: "sd-card sd-listrow"
			}, [G("div", fu, [
				G("h3", null, N(e.title), 1),
				G("p", null, [
					q(N(z(tc)[e.category] || e.category) + " · 重要度 " + N(e.importance), 1),
					e.locked ? (U(), W("span", pu, " · 已锁定")) : J("", !0),
					e.permanent ? (U(), W("span", mu, " · 常驻")) : J("", !0)
				]),
				G("p", null, N(e.content), 1)
			]), G("div", hu, [G("button", { onClick: (t) => S(e) }, "查看与编辑", 8, gu), o.value === "facts" ? (U(), W("button", {
				key: 0,
				onClick: (t) => {
					l.value = e.id, o.value = "graph";
				}
			}, "关系", 8, _u)) : J("", !0)])]))), 128))
		], 64))], 64)) : (U(), W("p", Hl, N(z(t).blocker), 1));
	}
}), Xu = { type: "string" }, Zu = { type: ["string", "null"] }, Qu = (e) => ({
	type: "object",
	additionalProperties: !1,
	properties: e,
	required: Object.keys(e)
}), $u = (e, t) => ({
	name: `scene_diary_${e}`,
	strict: !0,
	value: Qu(t)
}), ed = Qu({
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
	title: Xu,
	content: Xu,
	people: {
		type: "array",
		items: Xu
	},
	aliases: {
		type: "array",
		items: Xu
	},
	importance: {
		type: "integer",
		minimum: 1,
		maximum: 5
	},
	storyTime: Zu
}), td = Object.freeze({
	diary: $u("diary", {
		title: Xu,
		diary: Xu
	}),
	memory: $u("memory", { memories: {
		type: "array",
		items: ed
	} }),
	growth: $u("growth", { characterGrowth: Xu }),
	maintenance: $u("maintenance", { operations: {
		type: "array",
		items: Qu({
			action: {
				type: "string",
				enum: ["merge", "link"]
			},
			memberIds: {
				type: "array",
				items: Xu
			},
			targetId: Zu,
			title: Zu,
			content: Zu,
			category: Zu,
			a: Zu,
			b: Zu,
			reason: Xu
		})
	} })
});
function nd(e) {
	let t = [];
	for (let n = e, r = 0; n && r < 4; n = n.cause, r++) t.push(String(n.message || n));
	return t.join(" ");
}
var rd = "上一轮响应缺少必需字段，或不是可解析的完整 JSON。请按格式重新输出完整 JSON 对象及必需数组；字符串内的换行写成 \\n，双引号写成 \\\"。不要输出 Markdown 或说明。";
function id(e, t = "json_schema") {
	return t === "json_object" ? { type: t } : {
		type: "json_schema",
		json_schema: {
			name: e.name,
			strict: e.strict ?? !0,
			schema: structuredClone(e.value)
		}
	};
}
function ad(e, t) {
	let n = [];
	for (let t = e, r = 0; t && r < 4; t = t.cause, r++) n.push(t);
	let r = nd(e), i = n.map((e) => `${e.code || ""} ${e.providerCode || ""} ${e.category || ""}`).join(" ");
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
function od(e) {
	return Object.assign(Error(e), { code: "SCENE_DIARY_SCHEMA" });
}
function sd(e, t, n) {
	let r = Array.isArray(t.type) ? t.type : [t.type];
	if (!r.some((t) => t === "null" ? e === null : t === "object" ? typeof e == "object" && !!e && !Array.isArray(e) : t === "array" ? Array.isArray(e) : t === "integer" ? Number.isInteger(e) : typeof e === t)) throw od(`${n} 类型不符合 JSON 协议（需要 ${r.join("/")}）`);
	if (t.enum && !t.enum.includes(e)) throw od(`${n} 不在允许值中`);
	if (typeof e == "number" && (e < (t.minimum ?? -Infinity) || e > (t.maximum ?? Infinity))) throw od(`${n} 超出允许范围`);
	if (typeof e == "object" && e && !Array.isArray(e)) {
		for (let r of t.required || []) if (!Object.hasOwn(e, r)) throw od(`${n}.${r} 缺少必需字段`);
		for (let r of Object.keys(e)) Object.hasOwn(t.properties || {}, r) && sd(e[r], t.properties[r], `${n}.${r}`);
	}
	Array.isArray(e) && t.items && e.forEach((e, r) => sd(e, t.items, `${n}[${r}]`));
}
function cd(e, t) {
	let n;
	try {
		n = typeof e == "string" ? JSON.parse(e.trim()) : e;
	} catch {
		throw od("JSON 无法完整解析");
	}
	let r = structuredClone(t.value);
	return t.name === td.maintenance.name && delete r.properties.operations.items, t.name === td.memory.name && delete r.properties.memories.items, sd(n, r, "$"), n;
}
var ld = "只输出一个完整、可解析的 JSON 对象及所有必需字段。不要输出 Markdown、说明或工具调用。";
function ud(e) {
	return Array.isArray(e) ? [...structuredClone(e), {
		role: "user",
		content: ld
	}] : [{
		role: "user",
		content: `${e}\n${ld}`
	}];
}
async function dd(e, t, n, r, i, a, { assertCurrent: o = () => {}, onProgress: s = () => {}, connectionLabel: c = "" } = {}) {
	let l = "json_schema", u = ud(t), d = async (t, r) => {
		o(), s(`正在请求 ${l}…`);
		let i = await e(t, r, id(n, l));
		return o(), i;
	}, f;
	try {
		f = await d(u, i);
	} catch (e) {
		if (!ad(e, l)) throw e;
		o(), l = "json_object", s("json_schema 被拒，尝试 json_object…");
		try {
			f = await d(u, i);
		} catch (t) {
			throw ad(t, l) ? Object.assign(/* @__PURE__ */ Error(`${a}连接${c ? `（${c}）` : ""}拒绝两种 JSON 格式：json_schema：${nd(e)}；json_object：${nd(t)}`), { code: "SCENE_DIARY_JSON_FORMATS_REJECTED" }) : t;
		}
	}
	let p = (e) => {
		let t = cd(e, n);
		try {
			return r(JSON.stringify(t));
		} catch (e) {
			throw /JSON.*无法解析|日记正文为空|角色成长内容为空|角色成长超过 \d+ 字符/.test(e.message) ? od(e.message) : e;
		}
	};
	try {
		return p(f);
	} catch (e) {
		if (e?.code !== "SCENE_DIARY_SCHEMA") throw e;
		o(), s(`使用 ${l} 修复 JSON 输出…`);
		let t = await d([...u, {
			role: "user",
			content: `${rd} 结构错误：${e.message}`
		}], Math.min(i * 2, 16384));
		try {
			return p(t);
		} catch (e) {
			throw e?.code === "SCENE_DIARY_SCHEMA" ? Object.assign(/* @__PURE__ */ Error(`${a}两次输出均未满足 JSON 格式或必需字段：${e.message}`), { code: "SCENE_DIARY_JSON_CONTENT" }) : e;
		}
	}
}
// redact.js
function fd(e, t = []) {
	let n = String(e ?? "");
	for (let e of t.filter((e) => typeof e == "string" && e.length)) n = n.split(e).join("[已隐藏]");
	return n.replace(/https?:\/\/[^\s"'<>]+/gi, "[地址已隐藏]").replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[已隐藏]").replace(/\bBearer\s+[^\s,"'}]+/gi, "Bearer [已隐藏]").replace(/((?:api[_-]?key|authorization|proxy_password|password|secret|token)\s*["']?\s*[:=]\s*)["']?[^\s,"'}]+/gi, "$1[已隐藏]").slice(0, 600);
}
// channels.js
var pd = "scene_diary_channels", md = "/api/backends/chat-completions/", hd = () => ({
	id: Xo("channel"),
	name: "",
	url: "",
	key: "",
	model: "",
	temperature: .4,
	maxTokens: 4096
});
function gd(e) {
	return e.extensionSettings?.[pd] || [];
}
function _d(e, t) {
	e.extensionSettings[pd] = t, e.saveSettingsDebounced();
}
function vd(e) {
	let t = new URL(e);
	if (!["http:", "https:"].includes(t.protocol) || t.username || t.password || t.search || t.hash) throw Error("请输入不含认证信息的 HTTP(S) API 地址。");
	let n = t.pathname.replace(/\/+$/, "").replace(/\/(?:chat\/completions|models)$/, "");
	return n ||= "/v1", t.origin + n;
}
function yd(e) {
	let t = vd(e.url);
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
async function bd(e, t, n, r, i) {
	let a = t.key ? { Authorization: "Bearer " + t.key } : {}, o = {
		chat_completion_source: "custom",
		custom_api_format: "openai_compat",
		custom_url: vd(t.url),
		custom_include_headers: JSON.stringify(a),
		...r
	};
	try {
		let r = await fetch(md + n, {
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
			throw Object.assign(Error(fd(e.message || (typeof e == "string" ? e : "HTTP " + r.status), [t.key])), {
				bridgeStatus: r.status,
				providerStatus: e.status || e.status_code,
				providerCode: fd(e.code || "", [t.key]),
				param: e.param
			});
		}
		if (String(s?.id || "").startsWith("tauritavern-error-")) throw Error("TauriTavern 代理未返回有效补全，请检查渠道或更新宿主。");
		return s;
	} catch (e) {
		throw i?.throwIfAborted(), e.message = fd(e.message, [t.key]), e;
	}
}
async function xd(e, t, n) {
	let r = await bd(e, t, "status", {}, n), i = r?.data ?? r?.models;
	if (!Array.isArray(i)) throw Error("代理未返回模型列表，可手动填写模型。");
	return i.map((e) => typeof e == "string" ? e : e.id).filter(Boolean).sort();
}
async function Sd(e, t, n, r, i, a) {
	let o = (await bd(e, t, "generate", {
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
var Cd = {
	name: "scene_diary_channel_test",
	value: {
		type: "object",
		additionalProperties: !1,
		properties: { ok: { type: "boolean" } },
		required: ["ok"]
	}
};
function wd(e, t, n) {
	return Td(e, yd(t), "返回 JSON {\"ok\":true}。", Cd, n, "渠道测试", void 0, 64);
}
function Td(e, t, n, r, i, a, o, s = t.maxTokens) {
	return dd((n, r, a) => Sd(e, t, n, Math.min(r, t.maxTokens), a, i), [{
		role: "system",
		content: "根据给出的素材与任务要求输出 JSON。"
	}, {
		role: "user",
		content: n
	}], r, JSON.parse, s, a, {
		assertCurrent: () => i?.throwIfAborted(),
		onProgress: o,
		connectionLabel: fd(t.name, [t.key])
	});
}
// src/pages/Settings.vue?vue&type=script&setup=true&lang.ts
var Ed = { class: "sd-card sd-stack" }, Dd = { class: "sd-section-title" }, Od = ["disabled"], kd = ["disabled", "onClick"], Ad = { class: "sd-form-grid" }, jd = { class: "sd-field" }, Md = { class: "sd-field" }, Nd = { class: "sd-field" }, Pd = { class: "sd-field" }, Fd = { id: "sd-channel-models" }, Id = ["value"], Ld = { class: "sd-field" }, Rd = { class: "sd-field" }, zd = { class: "sd-actions" }, Bd = ["disabled"], Vd = ["disabled"], Hd = ["disabled"], Ud = {
	key: 0,
	class: "sd-card"
}, Wd = { class: "sd-card sd-stack" }, Gd = { class: "sd-form-grid" }, Kd = ["onUpdate:modelValue"], qd = ["value"], Jd = {
	class: "sd-card",
	open: ""
}, Yd = { class: "sd-stack" }, Xd = { class: "sd-form-grid" }, Zd = { class: "sd-field" }, Qd = { class: "sd-field" }, $d = { class: "sd-field" }, ef = { class: "sd-field" }, tf = { class: "sd-field" }, nf = { class: "sd-field" }, rf = { class: "sd-field" }, af = { class: "sd-field" }, of = { class: "sd-field" }, sf = { class: "sd-card" }, cf = { class: "sd-stack" }, lf = { class: "sd-form-grid" }, uf = { class: "sd-field" }, df = { class: "sd-field" }, ff = { class: "sd-field" }, pf = { class: "sd-field" }, mf = { class: "sd-form-grid" }, hf = { class: "sd-field" }, gf = { class: "sd-field" }, _f = { class: "sd-field" }, vf = { class: "sd-card" }, yf = { class: "sd-stack" }, bf = ["onUpdate:modelValue"], xf = { class: "sd-card" }, Sf = { class: "sd-stack" }, Cf = { class: "sd-field" }, wf = { class: "sd-actions sd-sticky" }, Tf = /* @__PURE__ */ $n({
	__name: "Settings",
	setup(e) {
		let { view: t, host: n, run: r, notice: i, select: a } = $s(), o = /* @__PURE__ */ R(null), s = /* @__PURE__ */ R(null), c = /* @__PURE__ */ R([]), l = /* @__PURE__ */ R(!1), u = null;
		_r(() => u?.abort());
		let d = n.getContext, f = () => d().accountStorage, p = /* @__PURE__ */ R(f()?.getItem("scene_diary_embedding_key") || ""), m = /* @__PURE__ */ R(f()?.getItem("scene_diary_rerank_key") || ""), h = Y(() => JSON.stringify(t.value.state?.settings || null)), g = /* @__PURE__ */ R({});
		Hn(h, (e) => {
			if (o.value = JSON.parse(e), !o.value) return;
			let t = {};
			for (let e of ["user", "character"]) {
				t[e] = {};
				for (let n of ["bodyTagPairs", "storyTimeTagPairs"]) t[e][n] = o.value.extraction[e][n].map((e) => e.open + " " + e.close).join("\n");
			}
			g.value = t;
		}, { immediate: !0 });
		function _(e = hd()) {
			s.value = { ...e }, c.value = [];
		}
		function v() {
			return r(() => {
				let e = yd(s.value);
				_d(d(), [...t.value.channels.filter((t) => t.id !== e.id), e]), n.refresh(), s.value = null, i.value = "渠道已提交保存。";
			});
		}
		function y() {
			if (s.value && window.confirm("删除该渠道？已绑定的任务需要重新选择。")) return r(() => {
				_d(d(), t.value.channels.filter((e) => e.id !== s.value.id)), n.refresh(), s.value = null;
			});
		}
		async function b(e) {
			let t = u = new AbortController();
			l.value = !0;
			let n = { ...s.value };
			try {
				await r(async () => {
					if (e === "models") c.value = await xd(d(), n, t.signal), i.value = "返回 " + c.value.length + " 个模型。";
					else {
						if ((await wd(d(), n, t.signal)).ok !== !0) throw Error("渠道返回了意外的测试结果。");
						i.value = "结构化渠道测试通过。";
					}
				});
			} finally {
				u = null, l.value = !1;
			}
		}
		function x(e) {
			return e.split(/\r?\n/).map((e) => e.trim()).filter(Boolean).map((e) => {
				let [t, n] = e.split(/\s+/), r = ns({
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
				if (e.semantic.enabled && (e.semantic.endpoint = Ws(e.semantic.endpoint), !e.semantic.model.trim())) throw Error("请填写 Embedding 模型。");
				if (e.semantic.rerank && (e.semantic.rerankEndpoint = Ws(e.semantic.rerankEndpoint, "重排"), !e.semantic.rerankModel.trim())) throw Error("请填写重排模型。");
				let r = Object.fromEntries(Object.entries(e.bindings).filter(([, e]) => t.value.channels.some((t) => t.id === e))), i = f();
				for (let [e, t] of [["scene_diary_embedding_key", p.value], ["scene_diary_rerank_key", m.value]]) t.trim() ? i?.setItem(e, t.trim()) : i?.removeItem(e);
				await n.mutate((t) => {
					t.settings = cc({
						...e,
						bindings: r
					}), Object.keys(rc).every((e) => t.settings.bindings[e]) && (t.connectionSetupNeeded = !1);
				});
			});
		}
		return (e, n) => (U(), W(H, null, [G("section", Ed, [
			G("header", Dd, [n[32] ||= G("h3", null, "API 渠道", -1), G("button", {
				class: "sd-primary",
				disabled: l.value,
				onClick: n[0] ||= (e) => _()
			}, "新增渠道", 8, Od)]),
			n[39] ||= G("p", null, "渠道在当前酒馆账户内共用，任务分派按聊天保存。", -1),
			(U(!0), W(H, null, V(z(t).channels, (e) => (U(), W("div", {
				class: "sd-listrow",
				key: e.id
			}, [G("div", null, [G("strong", null, N(e.name), 1), G("p", null, N(e.model), 1)]), G("button", {
				disabled: l.value,
				onClick: (t) => _(e)
			}, "编辑", 8, kd)]))), 128)),
			s.value ? (U(), W("form", {
				key: 0,
				class: "sd-subcard sd-stack",
				onSubmit: Lo(v, ["prevent"])
			}, [G("div", Ad, [
				G("label", jd, [n[33] ||= q("名称", -1), B(G("input", {
					"onUpdate:modelValue": n[1] ||= (e) => s.value.name = e,
					autocomplete: "off",
					required: ""
				}, null, 512), [[X, s.value.name]])]),
				G("label", Md, [n[34] ||= q("OpenAI 兼容 API 地址", -1), B(G("input", {
					"onUpdate:modelValue": n[2] ||= (e) => s.value.url = e,
					type: "url",
					placeholder: "https://example.com/v1",
					required: ""
				}, null, 512), [[
					X,
					s.value.url,
					void 0,
					{ trim: !0 }
				]])]),
				G("label", Nd, [n[35] ||= q("API Key", -1), B(G("input", {
					"onUpdate:modelValue": n[3] ||= (e) => s.value.key = e,
					type: "password",
					autocomplete: "new-password"
				}, null, 512), [[X, s.value.key]])]),
				G("label", Pd, [
					n[36] ||= q("模型", -1),
					B(G("input", {
						"onUpdate:modelValue": n[4] ||= (e) => s.value.model = e,
						list: "sd-channel-models",
						required: ""
					}, null, 512), [[X, s.value.model]]),
					G("datalist", Fd, [(U(!0), W(H, null, V(c.value, (e) => (U(), W("option", {
						key: e,
						value: e
					}, null, 8, Id))), 128))])
				]),
				G("label", Ld, [n[37] ||= q("温度", -1), B(G("input", {
					"onUpdate:modelValue": n[5] ||= (e) => s.value.temperature = e,
					type: "number",
					min: "0",
					max: "2",
					step: "0.05",
					required: ""
				}, null, 512), [[
					X,
					s.value.temperature,
					void 0,
					{ number: !0 }
				]])]),
				G("label", Rd, [n[38] ||= q("最大输出 token", -1), B(G("input", {
					"onUpdate:modelValue": n[6] ||= (e) => s.value.maxTokens = e,
					type: "number",
					min: "1",
					step: "1",
					required: ""
				}, null, 512), [[
					X,
					s.value.maxTokens,
					void 0,
					{ number: !0 }
				]])])
			]), G("div", zd, [
				l.value ? (U(), W("button", {
					key: 0,
					type: "button",
					onClick: n[7] ||= (e) => z(u)?.abort()
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
				}, "关闭", 8, Bd),
				z(t).channels.some((e) => e.id === s.value.id) ? (U(), W("button", {
					key: 2,
					type: "button",
					class: "sd-danger",
					disabled: l.value,
					onClick: y
				}, "删除", 8, Vd)) : J("", !0),
				G("button", {
					class: "sd-primary",
					disabled: l.value
				}, "保存渠道", 8, Hd)
			])], 32)) : J("", !0)
		]), o.value ? (U(), W("form", {
			key: 1,
			class: "sd-stack",
			onSubmit: Lo(S, ["prevent"])
		}, [
			G("section", Wd, [n[41] ||= G("h3", null, "任务分派", -1), G("div", Gd, [(U(!0), W(H, null, V(z(rc), (e, r) => (U(), W("label", {
				key: r,
				class: "sd-field"
			}, [q(N(e) + " ", 1), B(G("select", { "onUpdate:modelValue": (e) => o.value.bindings[r] = e }, [n[40] ||= G("option", { value: void 0 }, "请选择渠道", -1), (U(!0), W(H, null, V(z(t).channels, (e) => (U(), W("option", {
				key: e.id,
				value: e.id
			}, N(e.name), 9, qd))), 128))], 8, Kd), [[Ao, o.value.bindings[r]]])]))), 128))])]),
			G("details", Jd, [n[53] ||= G("summary", null, "上下文与召回", -1), G("div", Yd, [
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[11] ||= (e) => o.value.growthEnabled = e
				}, null, 512), [[Oo, o.value.growthEnabled]]), n[42] ||= q(" 注入当前画像", -1)]),
				G("div", Xd, [
					G("label", Zd, [n[43] ||= q("近期日记篇数", -1), B(G("input", {
						"onUpdate:modelValue": n[12] ||= (e) => o.value.recentDiaryCount = e,
						type: "number",
						min: "0",
						max: "20",
						required: ""
					}, null, 512), [[
						X,
						o.value.recentDiaryCount,
						void 0,
						{ number: !0 }
					]])]),
					G("label", Qd, [n[44] ||= q("近期日记额度（留空不限）", -1), B(G("input", {
						"onUpdate:modelValue": n[13] ||= (e) => o.value.recentDiaryBudget = e,
						type: "number",
						min: "0"
					}, null, 512), [[
						X,
						o.value.recentDiaryBudget,
						void 0,
						{ number: !0 }
					]])]),
					G("label", $d, [n[45] ||= q("历史摘要额度", -1), B(G("input", {
						"onUpdate:modelValue": n[14] ||= (e) => o.value.historyBudget = e,
						type: "number",
						min: "0",
						required: ""
					}, null, 512), [[
						X,
						o.value.historyBudget,
						void 0,
						{ number: !0 }
					]])]),
					G("label", ef, [n[46] ||= q("长期事实额度", -1), B(G("input", {
						"onUpdate:modelValue": n[15] ||= (e) => o.value.memoryTokenBudget = e,
						type: "number",
						min: "0",
						required: ""
					}, null, 512), [[
						X,
						o.value.memoryTokenBudget,
						void 0,
						{ number: !0 }
					]])]),
					G("label", tf, [n[47] ||= q("用于查询的近邻消息数", -1), B(G("input", {
						"onUpdate:modelValue": n[16] ||= (e) => o.value.recallMessageCount = e,
						type: "number",
						min: "1",
						max: "20",
						required: ""
					}, null, 512), [[
						X,
						o.value.recallMessageCount,
						void 0,
						{ number: !0 }
					]])]),
					G("label", nf, [n[48] ||= q("事实条数上限", -1), B(G("input", {
						"onUpdate:modelValue": n[17] ||= (e) => o.value.recallLimit = e,
						type: "number",
						min: "0",
						max: "30",
						required: ""
					}, null, 512), [[
						X,
						o.value.recallLimit,
						void 0,
						{ number: !0 }
					]])]),
					G("label", rf, [n[49] ||= q("召回分数门槛", -1), B(G("input", {
						"onUpdate:modelValue": n[18] ||= (e) => o.value.recallScoreThreshold = e,
						type: "number",
						min: "0",
						max: "1",
						step: ".01",
						required: ""
					}, null, 512), [[
						X,
						o.value.recallScoreThreshold,
						void 0,
						{ number: !0 }
					]])]),
					G("label", af, [n[50] ||= q("图谱候选数量", -1), B(G("input", {
						"onUpdate:modelValue": n[19] ||= (e) => o.value.maintenanceCandidateLimit = e,
						type: "number",
						min: "1",
						max: "60",
						required: ""
					}, null, 512), [[
						X,
						o.value.maintenanceCandidateLimit,
						void 0,
						{ number: !0 }
					]])]),
					G("label", of, [n[51] ||= q("整理分数门槛", -1), B(G("input", {
						"onUpdate:modelValue": n[20] ||= (e) => o.value.maintenanceScoreThreshold = e,
						type: "number",
						min: "0",
						max: "1",
						step: ".01",
						required: ""
					}, null, 512), [[
						X,
						o.value.maintenanceScoreThreshold,
						void 0,
						{ number: !0 }
					]])])
				]),
				n[52] ||= G("p", null, "额度采用估算 token。单篇或单条超出可用额度时会跳过，可在诊断中查看。", -1)
			])]),
			G("details", sf, [n[63] ||= G("summary", null, "Embedding 与重排", -1), G("div", cf, [
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[21] ||= (e) => o.value.semantic.enabled = e
				}, null, 512), [[Oo, o.value.semantic.enabled]]), n[54] ||= q(" 使用向量检索", -1)]),
				G("div", lf, [
					G("label", uf, [n[55] ||= q("Embedding 完整地址", -1), B(G("input", {
						"onUpdate:modelValue": n[22] ||= (e) => o.value.semantic.endpoint = e,
						type: "url",
						placeholder: "https://example.com/v1/embeddings"
					}, null, 512), [[
						X,
						o.value.semantic.endpoint,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", df, [n[56] ||= q("Embedding 模型", -1), B(G("input", { "onUpdate:modelValue": n[23] ||= (e) => o.value.semantic.model = e }, null, 512), [[
						X,
						o.value.semantic.model,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", ff, [n[57] ||= q("Embedding 密钥", -1), B(G("input", {
						"onUpdate:modelValue": n[24] ||= (e) => p.value = e,
						type: "password",
						autocomplete: "new-password"
					}, null, 512), [[X, p.value]])]),
					G("label", pf, [n[58] ||= q("向量维度（可选）", -1), B(G("input", {
						"onUpdate:modelValue": n[25] ||= (e) => o.value.semantic.dimensions = e,
						type: "number",
						min: "1"
					}, null, 512), [[
						X,
						o.value.semantic.dimensions,
						void 0,
						{ number: !0 }
					]])])
				]),
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": n[26] ||= (e) => o.value.semantic.rerank = e
				}, null, 512), [[Oo, o.value.semantic.rerank]]), n[59] ||= q(" 使用 rerank 重排", -1)]),
				G("div", mf, [
					G("label", hf, [n[60] ||= q("Rerank 完整地址", -1), B(G("input", {
						"onUpdate:modelValue": n[27] ||= (e) => o.value.semantic.rerankEndpoint = e,
						type: "url",
						placeholder: "https://example.com/v1/rerank"
					}, null, 512), [[
						X,
						o.value.semantic.rerankEndpoint,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", gf, [n[61] ||= q("Rerank 模型", -1), B(G("input", { "onUpdate:modelValue": n[28] ||= (e) => o.value.semantic.rerankModel = e }, null, 512), [[
						X,
						o.value.semantic.rerankModel,
						void 0,
						{ trim: !0 }
					]])]),
					G("label", _f, [n[62] ||= q("Rerank 密钥", -1), B(G("input", {
						"onUpdate:modelValue": n[29] ||= (e) => m.value = e,
						type: "password",
						autocomplete: "new-password"
					}, null, 512), [[X, m.value]])])
				])
			])]),
			G("details", vf, [n[66] ||= G("summary", null, "正文和故事时间标签", -1), G("div", yf, [n[65] ||= G("p", null, "每行填写一对开始和结束标签，中间用空格分隔。正文标签留空时使用完整消息。", -1), (U(), W(H, null, V(["user", "character"], (e) => G("div", {
				key: e,
				class: "sd-stack"
			}, [
				G("h3", null, N(e === "user" ? "玩家" : "角色"), 1),
				K(Sc, {
					modelValue: g.value[e].bodyTagPairs,
					"onUpdate:modelValue": (t) => g.value[e].bodyTagPairs = t,
					label: "正文标签",
					rows: 2
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				K(Sc, {
					modelValue: g.value[e].storyTimeTagPairs,
					"onUpdate:modelValue": (t) => g.value[e].storyTimeTagPairs = t,
					label: "故事时间标签",
					rows: 2
				}, null, 8, ["modelValue", "onUpdate:modelValue"]),
				G("label", null, [B(G("input", {
					type: "checkbox",
					"onUpdate:modelValue": (t) => o.value.extraction[e].requiredStoryTime = t
				}, null, 8, bf), [[Oo, o.value.extraction[e].requiredStoryTime]]), n[64] ||= q(" 故事时间必填", -1)])
			])), 64))])]),
			G("details", xf, [n[68] ||= G("summary", null, "任务提示词", -1), G("div", Sf, [G("label", Cf, [n[67] ||= q("日记目标长度", -1), B(G("input", { "onUpdate:modelValue": n[30] ||= (e) => o.value.diaryTargetLength = e }, null, 512), [[X, o.value.diaryTargetLength]])]), (U(), W(H, null, V({
				diary: "日记",
				growth: "角色成长",
				memory: "事实提取",
				maintenance: "图谱整理"
			}, (e, t) => K(Sc, {
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
			G("div", wf, [G("button", {
				type: "button",
				onClick: n[31] ||= (e) => z(a)("diagnostics")
			}, "查看诊断"), n[69] ||= G("button", { class: "sd-primary" }, "保存聊天设置", -1)])
		], 32)) : (U(), W("p", Ud, N(z(t).blocker), 1))], 64));
	}
}), Ef = { class: "sd-card sd-stack" }, Df = { class: "sd-section-title" }, Of = { key: 0 }, kf = {
	key: 0,
	class: "sd-log"
}, Af = { key: 0 }, jf = { key: 0 }, Mf = /* @__PURE__ */ $n({
	__name: "Diagnostics",
	setup(e) {
		let { view: t, host: n } = $s();
		return (e, r) => (U(), W("section", Ef, [
			G("header", Df, [r[1] ||= G("h3", null, "运行诊断", -1), G("button", { onClick: r[0] ||= (...e) => z(n).cancelRecall && z(n).cancelRecall(...e) }, "取消当前召回")]),
			z(t).trace.length ? J("", !0) : (U(), W("p", Of, "暂无任务或召回记录。")),
			(U(!0), W(H, null, V(z(t).trace, (e, t) => (U(), W(H, { key: t }, [e.details?.length ? (U(), W("details", kf, [G("summary", null, [q(N(e.stage) + " · " + N(e.title) + " ", 1), e.ms == null ? J("", !0) : (U(), W("small", Af, N(Math.round(e.ms)) + " ms", 1))]), G("ul", null, [(U(!0), W(H, null, V(e.details, (e, t) => (U(), W("li", { key: t }, N(e), 1))), 128))])])) : (U(), W("p", {
				key: 1,
				class: fe(["sd-log", { "sd-alert": e.status === "error" || e.status === "warning" }])
			}, [q(N(e.stage) + " · " + N(e.title) + " ", 1), e.ms == null ? J("", !0) : (U(), W("small", jf, N(Math.round(e.ms)) + " ms", 1))], 2))], 64))), 128))
		]));
	}
}), Nf = {
	class: "sd-window",
	"data-tt-mobile-surface": "fullscreen-window",
	role: "dialog",
	"aria-modal": "true",
	"aria-labelledby": "sd-title"
}, Pf = { class: "sd-header" }, Ff = { class: "sd-heading" }, If = {
	id: "sd-title",
	tabindex: "-1"
}, Lf = { class: "sd-actions" }, Rf = ["aria-pressed"], zf = ["aria-pressed"], Bf = {
	class: "sd-tabs",
	"aria-label": "剧幕工作台导航"
}, Vf = ["aria-current", "onClick"], Hf = { class: "sd-body" }, Uf = {
	key: 0,
	class: "sd-alert",
	role: "alert"
}, Wf = { class: "sd-actions" }, Gf = {
	key: 1,
	class: "sd-alert",
	role: "alert"
}, Kf = {
	key: 2,
	class: "sd-status",
	role: "status"
}, qf = { class: "sd-status" }, Jf = {
	key: 0,
	class: "sd-card sd-stack"
}, Yf = { class: "sd-prose" }, Xf = { class: "sd-prose" }, Zf = {
	key: 0,
	class: "sd-prose"
}, Qf = { class: "sd-prose" }, $f = {
	key: 4,
	class: "sd-card"
}, ep = {
	class: "sd-footer",
	"aria-live": "polite"
}, tp = { key: 0 }, np = { key: 1 }, rp = { key: 2 }, ip = { key: 3 }, ap = /* @__PURE__ */ $n({
	__name: "App",
	setup(e) {
		let { view: t, host: n, opened: r, hasToolbar: i, page: a, error: o, notice: s, run: c, select: l, openWorkbench: u } = $s(), d = [
			{
				id: "workbench",
				label: "剧幕工作台",
				icon: "fa-clapperboard",
				component: pl
			},
			{
				id: "growth",
				label: "角色成长",
				icon: "fa-seedling",
				component: wl
			},
			{
				id: "diaries",
				label: "日记档案",
				icon: "fa-book-open",
				component: Vl
			},
			{
				id: "memory",
				label: "长期记忆",
				icon: "fa-diagram-project",
				component: Yu
			}
		], f = {
			...Object.fromEntries(d.map((e) => [e.id, e.component])),
			settings: Tf,
			diagnostics: Mf
		}, p = Y(() => f[a.value] || pl), m = Y(() => t.value.blocker.startsWith("检测到 SP") && t.value.persisted), h = Y(() => m.value?.diaries || m.value?.acts?.filter((e) => e.diary).map((e) => ({
			id: e.id,
			title: e.title,
			body: e.diary,
			summary: ""
		})) || []), g = Y(() => d.find((e) => e.id === a.value)?.label || (a.value === "settings" ? "设置" : "诊断")), _ = null;
		Hn(r, (e) => {
			e ? _ = document.activeElement : _?.focus();
		});
		function v(e) {
			e.key === "Escape" && !e.defaultPrevented && r.value && (r.value = !1, e.stopPropagation());
		}
		document.addEventListener("keydown", v), _r(() => document.removeEventListener("keydown", v));
		function y() {
			return c(() => ec(n.backup(), "scene-diary-" + t.value.chatId + ".json"));
		}
		return (e, f) => (U(), W(H, null, [z(i) ? J("", !0) : (U(), W("button", {
			key: 0,
			type: "button",
			class: "sd-floating",
			onClick: f[0] ||= (...e) => z(u) && z(u)(...e),
			title: "打开剧幕工作台",
			"aria-label": "打开剧幕工作台"
		}, [...f[6] ||= [G("i", { class: "fa-solid fa-clapperboard" }, null, -1)]])), z(r) ? (U(), W("div", {
			key: 1,
			class: "sd-backdrop",
			"data-tt-mobile-surface": "backdrop",
			onClick: f[5] ||= Lo((e) => r.value = !1, ["self"])
		}, [G("section", Nf, [
			G("header", Pf, [G("div", Ff, [f[7] ||= G("i", {
				class: "fa-solid fa-clapperboard",
				"aria-hidden": "true"
			}, null, -1), G("h2", If, N(g.value), 1)]), G("div", Lf, [
				G("button", {
					class: "sd-icon",
					title: "设置",
					"aria-label": "设置",
					"aria-pressed": z(a) === "settings",
					onClick: f[1] ||= (e) => z(l)("settings")
				}, [...f[8] ||= [G("i", { class: "fa-solid fa-gear" }, null, -1)]], 8, Rf),
				G("button", {
					class: "sd-icon",
					title: "诊断",
					"aria-label": "诊断",
					"aria-pressed": z(a) === "diagnostics",
					onClick: f[2] ||= (e) => z(l)("diagnostics")
				}, [...f[9] ||= [G("i", { class: "fa-solid fa-list-check" }, null, -1)]], 8, zf),
				G("button", {
					class: "sd-icon",
					title: "关闭",
					"aria-label": "关闭",
					onClick: f[3] ||= (e) => r.value = !1
				}, [...f[10] ||= [G("i", { class: "fa-solid fa-xmark" }, null, -1)]])
			])]),
			G("nav", Bf, [(U(), W(H, null, V(d, (e) => G("button", {
				key: e.id,
				"aria-current": z(a) === e.id ? "page" : void 0,
				onClick: (t) => z(l)(e.id)
			}, [G("i", {
				class: fe("fa-solid " + e.icon),
				"aria-hidden": "true"
			}, null, 2), G("span", null, N(e.label), 1)], 8, Vf)), 64))]),
			G("div", Hf, [
				z(t).saveError ? (U(), W("aside", Uf, [G("span", null, "保存失败。" + N(z(t).saveError) + " 当前内容仍可编辑。", 1), G("div", Wf, [G("button", { onClick: f[4] ||= (e) => z(c)(z(n).save) }, "重试保存"), z(t).state ? (U(), W("button", {
					key: 0,
					onClick: y
				}, "导出内容")) : J("", !0)])])) : J("", !0),
				z(o) ? (U(), W("aside", Gf, N(z(o)), 1)) : J("", !0),
				z(s) ? (U(), W("aside", Kf, N(z(s)), 1)) : J("", !0),
				m.value && [
					"growth",
					"diaries",
					"memory"
				].includes(z(a)) ? (U(), W(H, { key: 3 }, [G("p", qf, N(z(t).blocker) + " 已有内容可查阅。", 1), z(a) === "growth" ? (U(), W("section", Jf, [f[11] ||= G("h3", null, "当前角色画像", -1), G("p", Yf, N(m.value.characterGrowth?.content || "尚未建立画像。"), 1)])) : z(a) === "diaries" ? (U(!0), W(H, { key: 1 }, V(h.value, (e) => (U(), W("article", {
					key: e.id,
					class: "sd-card sd-stack"
				}, [
					G("h3", null, N(e.title), 1),
					G("p", Xf, N(e.body), 1),
					e.summary ? (U(), W("p", Zf, N(e.summary), 1)) : J("", !0)
				]))), 128)) : (U(!0), W(H, { key: 2 }, V(m.value.memories || [], (e) => (U(), W("article", {
					key: e.id,
					class: "sd-card sd-stack"
				}, [G("h3", null, N(e.title), 1), G("p", Qf, N(e.content), 1)]))), 128))], 64)) : m.value && z(a) === "settings" ? (U(), W("p", $f, N(z(t).blocker), 1)) : (U(), ea(Tr(p.value), { key: z(t).chatId + "-" + z(a) }))
			]),
			G("footer", ep, [z(t).pendingSaves ? (U(), W("span", tp, "正在保存…")) : z(t).saveError ? (U(), W("span", np, "保存失败")) : z(t).saved ? (U(), W("span", rp, "已提交宿主保存")) : (U(), W("span", ip, "scene&diary"))])
		])])) : J("", !0)], 64));
	}
});
// recall-v7.js
function op(e) {
	return e.diaries.filter((e) => !e.needsReview).slice().sort((e, t) => t.createdAt - e.createdAt);
}
function sp(e, t, n, r, i) {
	let a = [], o = [], s = 0;
	for (let c of e) {
		let e = i([...a, c].map(r));
		a.length >= t || Os(e) > n ? o.push(c) : (a.push(c), s = Os(e));
	}
	return {
		selected: a,
		skipped: o,
		cost: s,
		content: a.length ? i(a.map(r)) : ""
	};
}
var cp = (e) => (t) => "[" + e + "]\n" + t.join("\n\n") + "\n[/" + e + "]";
function lp(e) {
	let t = op(e), n = e.settings, r = sp(t.slice(0, n.recentDiaryCount), n.recentDiaryCount, n.recentDiaryBudget ?? Infinity, (e) => e.title + "\n" + e.body, cp("scene&diary 近期日记"));
	r.content = r.selected.length ? cp("scene&diary 近期日记")([...r.selected].reverse().map((e) => e.title + "\n" + e.body)) : "";
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
function up(e, t, n, r, i) {
	let a = new Map(e.map((e) => [e.id, e])), o = [...e.filter((e) => e.permanent).sort((e, t) => t.importance - e.importance).map((e) => ({
		memory: e,
		score: 1,
		via: "常驻"
	})), ...t.filter((e) => !e.memory.permanent && e.score >= i.recallScoreThreshold)], s = cp("scene&diary 长期事实"), c = i.memoryTokenBudget, l = (e) => As(e.memory), u = sp(o, i.recallLimit, c, l, s), d = new Set(u.selected.map((e) => e.memory.id)), f = new Set(ks(r)), p = new Map(t.map((e) => [e.memory.id, e.score])), m = [];
	for (let e of u.selected) for (let t of n) {
		let n = nc[t.type];
		if (!n) continue;
		let r = t.from === e.memory.id ? t.to : n.reverse && t.to === e.memory.id ? t.from : null, o = a.get(r);
		if (!o || d.has(r)) continue;
		let s = p.get(r) ?? 0;
		s < i.recallScoreThreshold && !ks(o.content).some((e) => f.has(e)) || (d.add(r), m.push({
			memory: o,
			score: s,
			via: n.label,
			reason: t.reason
		}));
	}
	m.sort((e, t) => t.score - e.score);
	let h = sp([...u.selected, ...m], i.recallLimit, c, l, s);
	return {
		...h,
		skipped: [...u.skipped, ...h.skipped]
	};
}
function dp(e, t, n, r, { localOnly: i = !1, strict: a = !1 } = {}) {
	let o = e.settings.semantic, s = e.settings, c = /* @__PURE__ */ new Map();
	return async (l, u, d, { includePermanent: f = !1, useImportance: p = !0, excludeId: m = null } = {}) => {
		if (r?.throwIfAborted(), !l.length || !u.trim()) return [];
		let h = performance.now(), g = d === "历史日记" ? ms(JSON.stringify(l)) : e.memoryRevision, _ = zs(l, d + ":" + g, { includePermanent: f }), v = l.filter((e) => f || !e.permanent), y = [t.embeddingKey, t.rerankKey], b = {
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
			x("语义服务", "warning", Gs(e, y));
		}, C = _(u, {
			useImportance: p,
			excludeId: m
		});
		if (x("BM25", "success", "候选 " + C.length + " 条"), !i && o.enabled && v.length) try {
			let e = d + ":" + g + ":" + f;
			c.has(e) || c.set(e, pp(v, b, o, t, r));
			let n = c.get(e), i = m && v.find((e) => e.id === m && e.content === u), [a, [s]] = await Promise.all([n, i ? n.then((e) => [e.get(i.id)]) : Js([u], o, t.embeddingKey, { signal: r })]);
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
			let e = await qs(u, C.map((e) => e.memory.content), o, t.rerankKey, { signal: r });
			C = Ls(C, e, {
				absolute: !0,
				useImportance: p
			}), x("重排", "success", "重排 " + e.length + " 条");
		} catch (e) {
			S(e);
		}
		return x("排名", "success", "候选按相关性排列", C.slice(0, Math.max(8, s.recallLimit)).map((e) => e.score.toFixed(3) + " " + e.memory.title)), C;
	};
}
var fp = /* @__PURE__ */ new Map();
async function pp(e, t, n, r, i) {
	let a = "scene-diary", o = "vectors-" + ms(JSON.stringify([
		t.space,
		n.endpoint,
		n.model,
		n.dimensions
	])), s = JSON.stringify([t, o]), c = fp.get(s), l = Promise.resolve(c).catch(() => {}).then(async () => {
		i?.throwIfAborted();
		let s = r.store, c = s ? await s.getJson({
			namespace: a,
			key: o
		}) || {} : null, l = c ? new Map(e.flatMap((e) => {
			let r = c[Us(t, n, e)];
			return Array.isArray(r) ? [[e.id, r]] : [];
		})) : await Ys(e, t, n), u = e.filter((e) => !l.has(e.id));
		for (let e = 0; e < u.length; e += 16) {
			let a = u.slice(e, e + 16), o = await Js(a.map((e) => e.content), n, r.embeddingKey, { signal: i });
			i?.throwIfAborted(), s || await Xs(a, o, t, n), a.forEach((e, t) => l.set(e.id, o[t]));
		}
		if (s && (u.length || Object.keys(c).length !== l.size)) {
			let r = Object.fromEntries(e.map((e) => [Us(t, n, e), l.get(e.id)]));
			await s.setJson({
				namespace: a,
				key: o,
				value: r
			});
		}
		return l;
	});
	fp.set(s, l);
	try {
		return await l;
	} finally {
		fp.get(s) === l && fp.delete(s);
	}
}
async function mp(e, t, n, r) {
	let i = lp(e), a = e.memories.filter(ac), [o, s] = await Promise.all([e.settings.memoryTokenBudget && e.settings.recallLimit ? n(a, t, "事实") : [], e.settings.historyBudget ? n(i.history, t, "历史日记", { useImportance: !1 }) : []]), c = sp(s.filter((t) => t.score >= e.settings.recallScoreThreshold).map((e) => e.memory), Infinity, e.settings.historyBudget, (e) => e.title + "\n" + e.content, cp("scene&diary 历史经历摘要")), l = up(a, o, e.edges, t, e.settings);
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
		u && cp("scene&diary 当前角色画像")([u]),
		i.full.content,
		c.content,
		l.content
	].filter(Boolean).join("\n\n");
}
function hp(e, t) {
	return mp(e, t, dp(e, {}, () => {}, null, { localOnly: !0 }), () => {});
}
// tasks-v7.js
var gp = { type: "string" }, _p = { type: ["string", "null"] }, vp = (e) => ({
	type: "array",
	items: e
}), yp = (e) => ({
	type: "string",
	enum: e
}), bp = (e) => ({
	type: "object",
	properties: e,
	required: Object.keys(e),
	additionalProperties: !1
}), xp = (e, t) => ({
	name: "scene_diary_" + e,
	value: bp(t)
}), Sp = bp({
	category: yp(Object.keys(tc)),
	title: gp,
	content: gp,
	people: vp(gp),
	aliases: vp(gp),
	importance: {
		type: "integer",
		minimum: 1,
		maximum: 5
	},
	storyTime: _p
}), Cp = {
	diary: xp("diary_with_summary", {
		title: gp,
		body: gp,
		summary: gp
	}),
	growth: xp("growth_evaluation", {
		changed: { type: "boolean" },
		content: gp
	}),
	memory: xp("facts", { facts: vp(Sp) }),
	decisions: xp("fact_decisions", { decisions: vp(bp({
		candidateId: gp,
		action: yp([
			"new",
			"duplicate",
			"supplement",
			"update"
		]),
		targetId: _p,
		content: gp
	})) }),
	summary: xp("summary", { summary: gp }),
	graph: xp("typed_edges", { edges: vp(bp({
		from: gp,
		to: gp,
		type: yp(Object.keys(nc)),
		reason: gp
	})) })
};
function wp(e, t) {
	if (!$(e)) throw Error(t + "为空，可重试或手动填写。");
	return $(e);
}
function Tp(e, t) {
	return Es(e, {
		char: t.character.char,
		user: t.character.user
	});
}
var Ep = "维护一份简洁的当前角色画像，聚焦仍然成立的人格、价值观、情感、信任、生活状态和重要经历的长期影响。结合初始设定，保留有证据的变化，避免按时间罗列或把日常写成成长。", Dp = "摘要应保留经历的经过、关键互动和长期意义，方便日后找回脉络，约 150–300 字。独立、精准的事实由事实库整理。";
async function Op(e, t, n, r, i, a, o = t.settings) {
	if (e === "growth") {
		let e = n.results.diary.value, r = e.summary || e.body, s = op(t).slice(0, o.recentDiaryCount), c = new Set(s.map((e) => e.id)), l = (await a(op(t).filter((e) => !c.has(e.id) && !e.summaryPending).map((e) => ({
			id: e.id,
			title: e.title,
			content: e.summary
		})), r, "历史日记", { useImportance: !1 })).filter((e) => e.score >= o.recallScoreThreshold).slice(0, 3), u = [...s.map((e) => e.summaryPending ? e.body : e.summary), ...l.map((e) => e.memory.content)], d = await i("growth", [
			Ep,
			Tp(o.prompts.growth, n),
			"只有实质变化才返回 changed=true 及完整画像，否则 changed=false、content=\"\"。",
			"初始设定：" + n.character.context,
			"现画像：" + t.characterGrowth.content,
			"近期与相关历史：" + u.join("\n\n"),
			"已确认的本幕日记：" + e.body
		].join("\n\n"), Cp.growth);
		return {
			changed: d.changed,
			content: d.changed ? wp(d.content, "候选画像") : ""
		};
	}
	let s = ws(r, o.extraction, n.character.char, n.character.user);
	if (s.errors.length) throw Error("正文或故事时间标签未匹配。" + s.errors.map((e) => "楼层 " + (e.index + 1) + " " + e.errors.join("、")).join("；"));
	if (e === "diary") {
		let e = await i("diary", [
			Tp(o.prompts.diary, n),
			Dp,
			"以角色第一人称保留情节、互动细节、关键对话与当时感受。正文目标长度 " + o.diaryTargetLength,
			"初始设定：" + n.character.context,
			"本幕对话：\n" + s.text
		].join("\n\n"), Cp.diary);
		return {
			title: $(e.title) || "未命名日记",
			body: wp(e.body, "日记正文"),
			summary: wp(e.summary, "日记摘要")
		};
	}
	return Ap(t, s, n, i, a, o);
}
var kp = (e) => ({
	id: e.id,
	category: e.category,
	title: e.title,
	content: e.content,
	storyTime: e.storyTime,
	locked: e.locked
});
async function Ap(e, t, n, r, i, a) {
	let o = (await r("memory", [
		Tp(a.prompts.memory, n),
		"提取四类可供后续直接使用的独立客观事实。忽略日常流水、愿望、推测、心理和未落实计划。无合格事实返回空数组。",
		"preference 偏好：主体、喜好或厌恶的对象。npc_relationship：NPC 与角色或玩家的客观关系。item：有用途、归属或特殊意义的物品。place：地点及可复用的位置、条件或用途。",
		"角色 " + n.character.char + "，玩家 " + n.character.user + "。故事时间仅使用对话中标出的时间。最多 30 条。",
		"本幕对话：\n" + t.text
	].join("\n\n"), Cp.memory)).facts.slice(0, 30).map((e) => oc(e)).filter(mc), s = e.memories.filter(ac), c = [];
	for (let e = 0; e < o.length; e += 4) {
		let t = o.slice(e, e + 4), n = await Promise.all(t.map(async (e) => ({
			candidate: e,
			existing: (await i(s, e.content, "事实", {
				includePermanent: !0,
				useImportance: !1
			})).filter((e) => e.score >= a.maintenanceScoreThreshold).slice(0, 5).map((e) => kp(e.memory))
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
				...kp(e),
				existing: t
			})))
		].join("\n\n"), Cp.decisions);
		for (let e of t) {
			let t = n.decisions.find((t) => t.candidateId === e.candidate.id);
			if (!t || t.action !== "new" && !e.existing.some((e) => e.id === t.targetId)) throw Error("事实判定遗漏候选或引用了无效目标，可重试此项。");
			l.set(e.candidate.id, t);
		}
	}
	return c.map(({ candidate: e, existing: t }) => {
		let n = l.get(e.id), r = n?.action || "new", i = r === "new" ? null : n.targetId, a = t.find((e) => e.id === i);
		return {
			id: Xo("proposal"),
			action: r,
			targetId: i,
			targetContent: a?.content,
			targetStoryTime: a?.storyTime,
			value: {
				...e,
				content: ["supplement", "update"].includes(r) ? wp(n.content, "拟更新事实") : e.content
			},
			accepted: r !== "duplicate" && !a?.locked
		};
	});
}
function jp(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let r of t.filter((e) => e.accepted && e.action !== "duplicate")) {
		if (!mc(r.value)) throw Error("已接受的事实必须分类并填写标题和正文。");
		let t = r.targetId;
		if (t) {
			if (n.has(t)) throw Error("同一事实有多条已接受的修改，请只保留一条。");
			let i = e.memories.find((e) => e.id === t);
			if (!ac(i) || i.locked) throw Error("修改目标已删除、未分类或已锁定，请重新审核。");
			if (r.targetContent !== i.content || r.targetStoryTime !== (i.storyTime ?? null)) throw Error("目标事实已修改，请重新提取或拒绝此建议。");
			n.add(t), hc(e, {
				title: r.value.title,
				content: r.value.content,
				storyTime: r.value.storyTime || i.storyTime,
				people: [...i.people, ...r.value.people],
				aliases: [...i.aliases, ...r.value.aliases]
			}, t);
		} else e.memories.some((e) => ac(e) && e.category === r.value.category && e.content.trim().toLocaleLowerCase() === r.value.content.trim().toLocaleLowerCase()) || hc(e, r.value);
	}
}
async function Mp(e, t) {
	return wp((await t("summary", Dp + "\n标题：" + e.title + "\n正文：\n" + e.body, Cp.summary)).summary, "日记摘要");
}
function Np(e, t = 12e3) {
	let n = [];
	for (let r = 0; r < e.length; r += t) n.push(e.slice(r, r + t));
	return n;
}
async function Pp(e, t) {
	return wp((await t("growth", "概括这批叙事材料中与持久人物状态有关的事实与变化，约 800 字。把阶段性变化与当前状态区分。输出 summary。\n" + e, Cp.summary)).summary, "成长归纳");
}
async function Fp(e, t, n, r) {
	let i = op(e).reverse();
	if (!i.length) throw Error("请先保存至少一篇有效日记。");
	let a = Np(i.map((e) => e.title + "\n" + e.body).join("\n\n")), o = 1;
	for (; a.length > 1;) {
		let e = [];
		for (let t of a) r("归纳第 " + o + " 层，第 " + (e.length + 1) + "/" + a.length + " 批"), e.push(await Pp(t, n));
		if (o++, e.join("\n\n").length >= a.join("\n\n").length) throw Error("归纳内容未缩短，请以较小的渠道输出额度重试。");
		a = Np(e.join("\n\n"));
	}
	let s = await n("growth", [
		Ep,
		"覆盖全部提供的历史素材，形成一份完整画像。现画像用于核对。",
		"初始设定：" + t.context,
		"现画像：" + e.characterGrowth.content,
		"日记材料：\n" + a[0]
	].join("\n\n"), Cp.growth);
	return wp(s.changed ? s.content : e.characterGrowth.content, "重整画像");
}
var Ip = (e) => ms(JSON.stringify(kp(e)));
async function Lp(e, t, n, r, i) {
	let a = e.memories.filter(ac), o = Object.fromEntries(a.map((e) => [e.id, Ip(e)])), s = t === "full" ? a : a.filter((t) => e.graphReviewed[t.id] !== o[t.id]), c = new Map(a.map((e) => [e.id, e])), l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), d = new Set(e.edges.map(fc));
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
			JSON.stringify(Object.fromEntries(Object.entries(nc).map(([e, t]) => [e, t.meaning]))),
			JSON.stringify(o.map((e) => e.map((e) => kp(c.get(e)))))
		].join("\n\n"), Cp.graph);
		for (let e of pc(l.edges, a)) s.has(JSON.stringify([e.from, e.to].sort())) && (t === "incremental" && d.has(fc(e)) || u.set(fc(e), {
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
var Rp = "0.4.1", zp = (e) => ["confirmed", "skipped"].includes(e?.status);
async function Bp(e, t, n = 0, r = !1, i = !1) {
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
function Vp(e, t, n = globalThis) {
	let r = () => e(), i = () => r().chatMetadata, a = () => String(r().chatId ?? ""), o = () => r().chat || [], s = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Map(), l = () => n.SillyTavern?.libs?.localforage, u = Xo("account"), d = () => {
		let e = r().accountStorage, t = e?.getItem("scene_diary_account_id") || u;
		return e?.getItem("scene_diary_account_id") || e?.setItem("scene_diary_account_id", t), t;
	}, f = null, p = Promise.resolve(), m = "", h = !1, g = 0, _ = "", v = [], y = "", b, x = 0, S = "", C = "", w = "", ee = null, te = async () => {
		let e = n.__TAURITAVERN__;
		return e ? (await e.ready, e.api?.chat?.current?.handle?.()) : null;
	}, T = (e) => !!e && f === e && e.id === a() && e.metadata === i(), E = () => f && T(f) && !_ ? i()?.[Wo] : null, D = () => E() || i()?.scene_diary, O = () => ({
		state: E(),
		persisted: D(),
		chatId: a(),
		blocker: _,
		saveError: m,
		saved: h,
		pendingSaves: g,
		trace: v,
		graphProgress: S,
		growthProgress: C,
		summaryProgress: w,
		growthPreview: ee,
		busy: [...c.keys()],
		channels: gd(r()),
		messages: o().length
	}), k = () => s.forEach((e) => e(O()));
	function A(e) {
		if (!e || !T(e)) throw new DOMException("聊天已切换", "AbortError");
	}
	function ne(e = !1) {
		let t = f;
		e && t.messageRevision++, g++, k();
		let n = p.then(async () => {
			if (!T(t)) return !1;
			let e = r(), n = t.messageRevision, i = n === t.savedMessageRevision ? e.saveMetadata || e.saveChat : e.saveChat || e.saveMetadata;
			if (!i) throw Error("宿主保存接口不可用。");
			return await i(), T(t) && (t.savedMessageRevision = n, m = "", h = !0), T(t);
		});
		return p = n.catch((e) => {
			T(t) && (m = e.message, h = !1);
		}).finally(() => {
			T(t) && (g--, k());
		}), n;
	}
	function j(e, t = !1) {
		let n = E();
		if (!n) throw Error("请先打开受支持的聊天。");
		let r = structuredClone(n), a = e(r);
		return r.lastUpdatedAt = Date.now(), i()[Wo] = r, k(), ne(t).then(() => a);
	}
	function M(e) {
		return "scene_diary_migration_backup_" + d() + "_" + a() + "_schema" + e + "_to7";
	}
	async function re() {
		let e = a(), s = i(), u = ++x;
		if (f?.id !== e || f?.metadata !== s) {
			for (let e of c.values()) e.abort();
			c.clear(), b?.abort(), f = {
				id: e,
				metadata: s,
				messageRevision: 0,
				savedMessageRevision: 0
			}, m = "", h = !1, g = 0, v = [], y = "", S = "", C = "", w = "", ee = null, t("");
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
		let E = s[Wo];
		if (E?.version > 7) _ = "聊天数据版本高于当前插件支持范围，请使用对应的插件版本。", k();
		else if (E && E.version !== 7) {
			_ = "正在备份旧聊天…", k();
			try {
				let t = M(E.version), n = await te(), r = await Bp(o(), n?.history, 0, !0, !0);
				if (!T(p) || u !== x || (await l().getItem(t) || await l().setItem(t, {
					schema: E.version,
					savedAt: Date.now(),
					metadata: structuredClone(s),
					messages: structuredClone(r),
					pendingRecovery: E.memorySpaceId ? await l().getItem("scene_diary_recovery_" + d() + "_" + e + "_" + E.memorySpaceId) : null
				}), !T(p) || u !== x || s.scene_diary !== E)) return;
				s[Wo] = uc(E), _ = "", await ne();
			} catch (e) {
				T(p) && s.scene_diary === E && (_ = "迁移备份失败，旧聊天仍保留。" + e.message, k());
			}
		} else if (!E && o().filter(_s).length > 1) _ = "已有聊天，请选择开始接管的楼层。", k();
		else {
			if (_ = "", !E) await ie(0);
			else {
				let e = E.pendingTransaction;
				e && ic.some((t) => e.results[t]?.status === "running" && !c.has("close:" + t)) && await j((e) => {
					for (let t of ic) {
						let n = e.pendingTransaction.results[t];
						n?.status === "running" && !c.has("close:" + t) && (n.status = "error", n.error = "请求已中断，可单独重试本项。");
					}
				}), E.status === "active" && o().some((e) => _s(e) && !e.extra?.scene_diary?.actId) && await j((e) => o().forEach((t, n) => {
					_s(t) && !t.extra?.scene_diary?.actId && vs(e, t, e.currentActId, n);
				}), !0);
			}
			k();
		}
	}
	async function ie(e) {
		if (n.AutoCardUpdaterAPI || r().groupId || !a() || i()?.scene_diary) return;
		_ = "";
		let t = lc();
		o().forEach((n, r) => {
			r >= e && _s(n) && vs(t, n, 1, r);
		}), fs(t).startMessageIndex = e, i()[Wo] = t, await ne(!0);
	}
	async function ae(e, t) {
		if (!e.messageIds.length) return [];
		let n = o(), r = new Set(e.messageIds), i = (t) => t.filter((t) => _s(t) && Number(t.extra?.scene_diary?.actId) === e.id && r.has(t.extra?.scene_diary?.messageId)), a = i(n);
		if (a.length === r.size) return a;
		let s = await te();
		if (A(t), !s?.history) return a;
		let c = await Bp(n, s.history, 0, !0);
		return A(t), n.every(Boolean) && c.length <= n.length ? a : i(c);
	}
	function oe() {
		let e = r(), t = e.getCharacterCardFields?.() || {};
		return {
			char: e.name2 || t.name || "角色",
			user: e.name1 || "玩家",
			context: Ds(t)
		};
	}
	async function se() {
		let e = f, t = E(), n = fs(t);
		if (!n || t.status !== "active") return;
		let r = await ae(n, e);
		if (!r.length) throw Error("本幕没有可整理的对话。");
		if (A(e), E() !== t) throw Error("当前幕已变化，请重新结束本幕。");
		await j((e) => {
			e.status = "preview", fs(e).status = "closing", e.pendingTransaction = {
				id: Xo("close"),
				actId: n.id,
				sourceFingerprint: hs(r),
				character: oe(),
				growthRevision: e.characterGrowth.revision,
				results: Object.fromEntries(ic.map((e) => [e, { status: "idle" }]))
			};
		}), await Promise.allSettled([pe("diary"), pe("memory")]);
	}
	function ce(e) {
		if (c.has(e)) return null;
		let t = new AbortController();
		return c.set(e, t), k(), t;
	}
	function le(e, t) {
		c.get(e) === t && (c.delete(e), k());
	}
	let ue = (e, t) => {
		T(e) && (v.push(t), v.length > 100 && v.shift(), k());
	};
	function de(e, t, n, i) {
		let a = new Map(gd(r()).map((e) => [e.id, structuredClone(e)]));
		return (o, s, c) => {
			A(n), t.throwIfAborted();
			let l = a.get(e.settings.bindings[o]);
			if (!l) throw Error("请在设置中为「" + rc[o] + "」绑定自建渠道。");
			return Td(r(), l, s, c, t, rc[o], i);
		};
	}
	async function fe(e, t, n, i) {
		let a = await te();
		A(t);
		let o = r().accountStorage;
		return dp(e, {
			chat: t.id,
			account: d(),
			store: a?.store,
			embeddingKey: o?.getItem("scene_diary_embedding_key") || "",
			rerankKey: o?.getItem("scene_diary_rerank_key") || ""
		}, (e) => ue(t, e), n, i);
	}
	async function pe(e) {
		let t = f, n = E(), r = n?.pendingTransaction;
		if (!r || !ic.includes(e) || e === "growth" && r.results.diary.status !== "confirmed") return;
		let i = "close:" + e, a = ce(i);
		if (!a) return;
		let o = a.signal, s = de(n, o, t, (n) => ue(t, {
			stage: rc[e],
			title: n
		})), l = r.results[e], u = () => T(t) && E()?.pendingTransaction?.id === r.id && c.get(i) === a;
		try {
			let i = structuredClone(await ae(fs(n), t));
			if (o.throwIfAborted(), !u() || hs(i) !== r.sourceFingerprint) throw Error("本幕对话已经修改，请取消关幕后重开审核。");
			if (e === "growth" && E().pendingTransaction.results.diary !== r.results.diary && JSON.stringify(E().pendingTransaction.results.diary) !== JSON.stringify(r.results.diary)) throw Error("已确认日记已变化，请重新评估成长。");
			e === "diary" && c.get("close:growth")?.abort(), await j((t) => {
				t.pendingTransaction.results[e] = {
					...l,
					status: "running",
					error: ""
				}, e === "diary" && me(t.pendingTransaction);
			}), o.throwIfAborted();
			let a = await Op(e, n, r, i, s, await fe(n, t, o));
			if (!u()) return;
			if (o.throwIfAborted(), e !== "growth" && hs(await ae(fs(E()), t)) !== r.sourceFingerprint) throw Error("本幕对话已经修改，请取消关幕后重开审核。");
			if (!u()) return;
			o.throwIfAborted(), await j((t) => {
				t.pendingTransaction.results[e] = {
					status: "draft",
					value: a
				}, e === "growth" && (t.pendingTransaction.growthRevision = n.characterGrowth.revision);
			}).catch(() => {});
		} catch (t) {
			if (!u()) return;
			let n = E().pendingTransaction.results[e];
			if (n.status === "outdated" || n.status === "skipped") return;
			await j((n) => {
				n.pendingTransaction.results[e] = {
					...l,
					status: "error",
					error: t.message
				};
			}).catch(() => {});
		} finally {
			le(i, a);
		}
	}
	function me(e) {
		let t = e.results.growth;
		e.results.growth = t.value ? {
			...t,
			status: "outdated"
		} : { status: "idle" };
	}
	async function he(e, t, n = !1, r = !0) {
		if (c.has("close:" + e) || !ic.includes(e)) return;
		let i = E()?.pendingTransaction;
		if (!i || e === "growth" && i.results.diary.status !== "confirmed") return;
		if (!n && t == null) throw Error("请填写或生成审核内容。");
		if (r && !n && e === "diary" && (!$(t.body) || !$(t.summary))) throw Error("请填写日记正文和摘要。");
		if (r && !n && e === "growth" && t.changed && !$(t.content)) throw Error("请填写候选画像。");
		let a = e === "diary" && (n || !r || i.results.diary.status !== "confirmed" || JSON.stringify(i.results.diary.value) !== JSON.stringify(t));
		if (a && c.get("close:growth")?.abort(), e === "growth" && r && !n && i.results.growth.value && i.growthRevision !== E().characterGrowth.revision) throw Error("当前画像已修改，请重新评估成长。");
		await j((i) => {
			let o = i.pendingTransaction;
			o.results[e] = n ? { status: "skipped" } : {
				status: r ? "confirmed" : "draft",
				value: t
			}, e === "diary" && (n ? o.results.growth = { status: "skipped" } : a && me(o)), e === "growth" && (o.growthRevision = i.characterGrowth.revision);
		}), e === "diary" && !n && r && ["idle", "outdated"].includes(E()?.pendingTransaction?.results.growth.status) && await pe("growth");
	}
	async function ge() {
		let e = f, t = E(), n = t?.pendingTransaction;
		if (!n || !ic.every((e) => zp(n.results[e]))) throw Error("请先处理三项审核。");
		let r = await ae(fs(t), e);
		if (A(e), E() !== t) throw Error("审核内容已变化，请重试提交。");
		if (hs(r) !== n.sourceFingerprint) throw Error("本幕来源已变化，请取消后重新整理。");
		await j((e) => {
			let t = fs(e), { diary: i, growth: a, memory: o } = n.results;
			if (a.status === "confirmed" && e.characterGrowth.revision !== n.growthRevision) throw Error("当前画像已修改，请重新评估成长。");
			o.status === "confirmed" && jp(e, o.value), i.status === "confirmed" && e.diaries.push(sc({
				...i.value,
				createdAt: Date.now()
			})), a.status === "confirmed" && a.value.changed && dc(e, a.value.content, {
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
	function _e() {
		for (let e of ic) {
			let t = "close:" + e;
			c.get(t)?.abort(), c.delete(t);
		}
		return j((e) => {
			fs(e).status = "active", e.status = "active", e.pendingTransaction = null;
		});
	}
	async function ve(e) {
		let t = f, n = E(), r = "summary", i = n && ce(r);
		if (!i || !n) return;
		let a = de(n, i.signal, t), o = n.diaries.filter((t) => e.includes(t.id));
		try {
			for (let e of o) {
				w = "正在整理 " + e.title, k();
				let n = await Mp(e, a);
				i.signal.throwIfAborted(), A(t), await j((t) => {
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
			T(t) && (w = ""), le(r, i);
		}
	}
	async function ye() {
		let e = f, t = E(), n = "growth", r = t && ce(n);
		if (r && t) try {
			let n = await Fp(t, oe(), de(t, r.signal, e), (t) => {
				T(e) && (C = t, k());
			});
			A(e), r.signal.throwIfAborted(), ee = {
				content: n,
				revision: t.characterGrowth.revision,
				diaries: JSON.stringify(t.diaries)
			};
		} finally {
			T(e) && (C = ""), le(n, r);
		}
	}
	async function be(e) {
		ee && (await j((t) => {
			if (t.characterGrowth.revision !== ee.revision || JSON.stringify(t.diaries) !== ee.diaries) throw Error("画像或日记已变化，请重新重整。");
			if (!$(e)) throw Error("请填写候选画像。");
			dc(t, e);
		}), ee = null, k());
	}
	async function xe(e) {
		let t = f, n = E(), r = "graph", i = n && ce(r);
		if (!i || !n) return;
		let a = de(n, i.signal, t);
		try {
			let r = await Lp(n, e, a, await fe(n, t, i.signal, { strict: !0 }), (e) => {
				T(t) && (S = e, k());
			});
			A(t), i.signal.throwIfAborted(), await j((e) => {
				e.graphPreview = r;
			});
		} finally {
			T(t) && (S = ""), le(r, i);
		}
	}
	function Se(e) {
		return j((t) => {
			let n = t.graphPreview;
			if (!n || t.memoryRevision !== n.revision) throw Error("事实库已变化，请重新整理图谱。");
			let r = e.filter((e) => e.accepted), i = pc(r, t.memories);
			if (i.length !== r.length) throw Error("存在重复或无效关系，请检查关系端点、类型和依据。");
			t.edges = pc(n.mode === "full" ? i : [...t.edges, ...i], t.memories), t.graphReviewed = n.reviewed, t.graphPreview = null;
		});
	}
	async function N(e, i, a) {
		t(""), y = "";
		let s = E(), c = f;
		if (!s || n.AutoCardUpdaterAPI || !["active", "preview"].includes(s.status) || !Array.isArray(e)) return;
		b?.abort();
		let l = (b = new AbortController()).signal;
		v = [];
		try {
			let i = Ts(o().filter(_s).slice(-s.settings.recallMessageCount), s.settings.extraction);
			if (i.errors.length) throw Error("最近对话正文标签未匹配，请检查正文提取设置。");
			let a = await fe(s, c, l), u = await mp(s, i.text, a, (e) => ue(c, e));
			if (A(c), l.throwIfAborted(), !["active", "preview"].includes(E()?.status) || E()?.currentActId !== s.currentActId) throw new DOMException("当前剧幕已变化", "AbortError");
			if (E() !== s) throw Error("聊天内容已更新，请重新生成。");
			e.splice(0, e.length, ...bs(e, s.currentActId)), String(r().mainApi).toLowerCase() === "openai" ? y = u : t(u, Math.min(e.length, 100)), v.some((e) => e.status === "warning") && n.toastr?.warning?.("语义召回部分失败，详情见 scene&diary 诊断。");
		} catch (e) {
			if (!l.aborted && T(c)) {
				let t = Gs(e);
				ue(c, {
					stage: "召回",
					status: "error",
					title: t
				}), n.toastr?.error?.(t);
			}
			a?.(!0);
		}
	}
	async function Ce(e) {
		let t = E();
		if (!t || n.AutoCardUpdaterAPI || !["active", "preview"].includes(t.status) || !Array.isArray(e.chat)) return;
		let r = y;
		if (y = "", !e.dryRun) {
			js(e.chat, r);
			return;
		}
		let i = Ts(o().filter(_s).slice(-t.settings.recallMessageCount), t.settings.extraction);
		if (i.errors.length) return;
		let a = await hp(t, i.text);
		E() === t && js(e.chat, a);
	}
	function we(e, t) {
		let n = E(), r = o()[Number(e)];
		if (n && _s(r) && !!r.is_user === t && (["active", "preview"].includes(n.status) || t && n.status === "pending_next_act")) return j((t) => {
			t.status === "pending_next_act" ? ys(t, r, Number(e)) : vs(t, r, t.currentActId, Number(e));
		}, !0);
	}
	function P(e) {
		let t = E(), n = o()[Number(e)]?.extra?.scene_diary?.actId;
		if (!(!t || !t.diaries.length || n && t.acts.find((e) => e.id === n)?.status !== "closed" || t.characterGrowth.reviewRecommended)) return j((e) => {
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
		return a("CHAT_CHANGED", "chat_id_changed", re), a("CHAT_LOADED", "chatLoaded", re), a("MESSAGE_SENT", "message_sent", (e) => we(e, !0)), a("MESSAGE_RECEIVED", "message_received", (e) => we(e, !1)), a("MESSAGE_EDITED", "message_edited", P), a("MESSAGE_UPDATED", "message_updated", P), a("MESSAGE_SWIPED", "message_swiped", P), a("MESSAGE_DELETED", "message_deleted", () => P()), a("CHAT_COMPLETION_PROMPT_READY", "chat_completion_prompt_ready", Ce), a("GENERATION_STOPPED", "generation_stopped", () => {
			b?.abort(), y = "", t("");
		}), re();
	}
	return {
		snapshot: O,
		subscribe(e) {
			return s.add(e), e(O()), () => s.delete(e);
		},
		connect: Te,
		initialize: re,
		takeOver: ie,
		mutate: j,
		save: ne,
		getContext: e,
		rearrange: N,
		promptReady: Ce,
		openClose: se,
		runClose: pe,
		reviewPart: he,
		confirmClose: ge,
		cancelClose: _e,
		organize: xe,
		applyGraph: Se,
		generateGrowth: ye,
		acceptGrowth: be,
		discardGrowth() {
			ee = null, k();
		},
		summarizeAll: ve,
		cancel(e) {
			c.get(e)?.abort();
		},
		refresh: k,
		backup: () => vc(E(), a()),
		import: (e) => j((t) => Object.assign(t, yc(t, e, a()))),
		migrationBackup: async () => {
			for (let e = 6; e > 0; e--) {
				let t = await l()?.getItem(M(e));
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
function Hp(e, t) {
	let n = Vp(e, t);
	Object.assign(globalThis, {
		sceneDiaryRearrangeChat: n.rearrange,
		sceneDiary: {
			version: Rp,
			...n
		}
	});
	let r = () => {
		if (document.getElementById("scene-diary-root")) return;
		let e = document.createElement("div");
		e.id = "scene-diary-root", document.body.append(e);
		let t = Zs(n);
		Vo(ap).provide(Qs, t).mount(e);
		let r = document.getElementById("send_but");
		if (r) {
			let e = document.createElement("button");
			e.className = "sd-host-entry", e.type = "button", e.title = "打开 scene&diary 剧幕工作台", e.setAttribute("aria-label", e.title), e.innerHTML = "<i class=\"fa-solid fa-clapperboard\" aria-hidden=\"true\"></i>", e.addEventListener("click", t.openWorkbench), r.before(e), t.hasToolbar.value = !0;
		}
		t.run(n.connect);
	};
	document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r, { once: !0 }) : r();
}
export { Hp as install };

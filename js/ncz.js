!(function (e, r) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = r())
    : 'function' == typeof define && define.amd
    ? define(r)
    : ((e = 'undefined' != typeof globalThis ? globalThis : e || self).ncz =
        r());
})(this, function () {
  'use strict';
  var e =
      'undefined' != typeof globalThis
        ? globalThis
        : 'undefined' != typeof window
        ? window
        : 'undefined' != typeof global
        ? global
        : 'undefined' != typeof self
        ? self
        : {},
    r = function (e) {
      return e && e.Math == Math && e;
    },
    t =
      r('object' == typeof globalThis && globalThis) ||
      r('object' == typeof window && window) ||
      r('object' == typeof self && self) ||
      r('object' == typeof e && e) ||
      (function () {
        return this;
      })() ||
      Function('return this')(),
    n = {},
    o = function (e) {
      try {
        return !!e();
      } catch (e) {
        return !0;
      }
    },
    c = !o(function () {
      return (
        7 !=
        Object.defineProperty({}, 1, {
          get: function () {
            return 7;
          },
        })[1]
      );
    }),
    i = !o(function () {
      var e = function () {}.bind();
      return 'function' != typeof e || e.hasOwnProperty('prototype');
    }),
    a = i,
    u = Function.prototype.call,
    s = a
      ? u.bind(u)
      : function () {
          return u.apply(u, arguments);
        },
    l = {},
    f = {}.propertyIsEnumerable,
    d = Object.getOwnPropertyDescriptor,
    p = d && !f.call({ 1: 2 }, 1);
  l.f = p
    ? function (e) {
        var r = d(this, e);
        return !!r && r.enumerable;
      }
    : f;
  var g,
    v,
    b = function (e, r) {
      return {
        enumerable: !(1 & e),
        configurable: !(2 & e),
        writable: !(4 & e),
        value: r,
      };
    },
    h = i,
    y = Function.prototype,
    m = y.bind,
    w = y.call,
    O = h && m.bind(w, w),
    S = h
      ? function (e) {
          return e && O(e);
        }
      : function (e) {
          return (
            e &&
            function () {
              return w.apply(e, arguments);
            }
          );
        },
    k = S,
    x = k({}.toString),
    j = k(''.slice),
    _ = function (e) {
      return j(x(e), 8, -1);
    },
    E = o,
    T = _,
    A = Object,
    I = S(''.split),
    C = E(function () {
      return !A('z').propertyIsEnumerable(0);
    })
      ? function (e) {
          return 'String' == T(e) ? I(e, '') : A(e);
        }
      : A,
    P = TypeError,
    F = function (e) {
      if (null == e) throw P("Can't call method on " + e);
      return e;
    },
    R = C,
    M = F,
    N = function (e) {
      return R(M(e));
    },
    D = function (e) {
      return 'function' == typeof e;
    },
    J = D,
    B = function (e) {
      return 'object' == typeof e ? null !== e : J(e);
    },
    W = t,
    L = D,
    V = function (e) {
      return L(e) ? e : void 0;
    },
    z = function (e, r) {
      return arguments.length < 2 ? V(W[e]) : W[e] && W[e][r];
    },
    U = S({}.isPrototypeOf),
    $ = t,
    G = z('navigator', 'userAgent') || '',
    H = $.process,
    K = $.Deno,
    X = (H && H.versions) || (K && K.version),
    Y = X && X.v8;
  Y && (v = (g = Y.split('.'))[0] > 0 && g[0] < 4 ? 1 : +(g[0] + g[1])),
    !v &&
      G &&
      (!(g = G.match(/Edge\/(\d+)/)) || g[1] >= 74) &&
      (g = G.match(/Chrome\/(\d+)/)) &&
      (v = +g[1]);
  var q = v,
    Q = o,
    Z =
      !!Object.getOwnPropertySymbols &&
      !Q(function () {
        var e = Symbol();
        return (
          !String(e) ||
          !(Object(e) instanceof Symbol) ||
          (!Symbol.sham && q && q < 41)
        );
      }),
    ee = Z && !Symbol.sham && 'symbol' == typeof Symbol.iterator,
    re = z,
    te = D,
    ne = U,
    oe = Object,
    ce = ee
      ? function (e) {
          return 'symbol' == typeof e;
        }
      : function (e) {
          var r = re('Symbol');
          return te(r) && ne(r.prototype, oe(e));
        },
    ie = String,
    ae = D,
    ue = function (e) {
      try {
        return ie(e);
      } catch (e) {
        return 'Object';
      }
    },
    se = TypeError,
    le = function (e) {
      if (ae(e)) return e;
      throw se(ue(e) + ' is not a function');
    },
    fe = function (e, r) {
      var t = e[r];
      return null == t ? void 0 : le(t);
    },
    de = s,
    pe = D,
    ge = B,
    ve = TypeError,
    be = { exports: {} },
    he = t,
    ye = Object.defineProperty,
    me = function (e, r) {
      try {
        ye(he, e, { value: r, configurable: !0, writable: !0 });
      } catch (t) {
        he[e] = r;
      }
      return r;
    },
    we = me,
    Oe = '__core-js_shared__',
    Se = t[Oe] || we(Oe, {}),
    ke = Se;
  (be.exports = function (e, r) {
    return ke[e] || (ke[e] = void 0 !== r ? r : {});
  })('versions', []).push({
    version: '3.24.1',
    mode: 'global',
    copyright: '\xa9 2014-2022 Denis Pushkarev (zloirock.ru)',
    license: 'https://github.com/zloirock/core-js/blob/v3.24.1/LICENSE',
    source: 'https://github.com/zloirock/core-js',
  });
  var xe = F,
    je = Object,
    _e = function (e) {
      return je(xe(e));
    },
    Ee = S({}.hasOwnProperty),
    Te =
      Object.hasOwn ||
      function (e, r) {
        return Ee(_e(e), r);
      },
    Ae = S,
    Ie = 0,
    Ce = Math.random(),
    Pe = Ae((1).toString),
    Fe = function (e) {
      return 'Symbol(' + (void 0 === e ? '' : e) + ')_' + Pe(++Ie + Ce, 36);
    },
    Re = t,
    Me = be.exports,
    Ne = Te,
    De = Fe,
    Je = Z,
    Be = ee,
    We = Me('wks'),
    Le = Re.Symbol,
    Ve = Le && Le.for,
    ze = Be ? Le : (Le && Le.withoutSetter) || De,
    Ue = function (e) {
      if (!Ne(We, e) || (!Je && 'string' != typeof We[e])) {
        var r = 'Symbol.' + e;
        Je && Ne(Le, e) ? (We[e] = Le[e]) : (We[e] = Be && Ve ? Ve(r) : ze(r));
      }
      return We[e];
    },
    $e = s,
    Ge = B,
    He = ce,
    Ke = fe,
    Xe = function (e, r) {
      var t, n;
      if ('string' === r && pe((t = e.toString)) && !ge((n = de(t, e))))
        return n;
      if (pe((t = e.valueOf)) && !ge((n = de(t, e)))) return n;
      if ('string' !== r && pe((t = e.toString)) && !ge((n = de(t, e))))
        return n;
      throw ve("Can't convert object to primitive value");
    },
    Ye = TypeError,
    qe = Ue('toPrimitive'),
    Qe = function (e, r) {
      if (!Ge(e) || He(e)) return e;
      var t,
        n = Ke(e, qe);
      if (n) {
        if (
          (void 0 === r && (r = 'default'), (t = $e(n, e, r)), !Ge(t) || He(t))
        )
          return t;
        throw Ye("Can't convert object to primitive value");
      }
      return void 0 === r && (r = 'number'), Xe(e, r);
    },
    Ze = ce,
    er = function (e) {
      var r = Qe(e, 'string');
      return Ze(r) ? r : r + '';
    },
    rr = B,
    tr = t.document,
    nr = rr(tr) && rr(tr.createElement),
    or = function (e) {
      return nr ? tr.createElement(e) : {};
    },
    cr = or,
    ir =
      !c &&
      !o(function () {
        return (
          7 !=
          Object.defineProperty(cr('div'), 'a', {
            get: function () {
              return 7;
            },
          }).a
        );
      }),
    ar = c,
    ur = s,
    sr = l,
    lr = b,
    fr = N,
    dr = er,
    pr = Te,
    gr = ir,
    vr = Object.getOwnPropertyDescriptor;
  n.f = ar
    ? vr
    : function (e, r) {
        if (((e = fr(e)), (r = dr(r)), gr))
          try {
            return vr(e, r);
          } catch (e) {}
        if (pr(e, r)) return lr(!ur(sr.f, e, r), e[r]);
      };
  var br = {},
    hr =
      c &&
      o(function () {
        return (
          42 !=
          Object.defineProperty(function () {}, 'prototype', {
            value: 42,
            writable: !1,
          }).prototype
        );
      }),
    yr = B,
    mr = String,
    wr = TypeError,
    Or = function (e) {
      if (yr(e)) return e;
      throw wr(mr(e) + ' is not an object');
    },
    Sr = c,
    kr = ir,
    xr = hr,
    jr = Or,
    _r = er,
    Er = TypeError,
    Tr = Object.defineProperty,
    Ar = Object.getOwnPropertyDescriptor,
    Ir = 'enumerable',
    Cr = 'configurable',
    Pr = 'writable';
  br.f = Sr
    ? xr
      ? function (e, r, t) {
          if (
            (jr(e),
            (r = _r(r)),
            jr(t),
            'function' == typeof e &&
              'prototype' === r &&
              'value' in t &&
              Pr in t &&
              !t.writable)
          ) {
            var n = Ar(e, r);
            n &&
              n.writable &&
              ((e[r] = t.value),
              (t = {
                configurable: Cr in t ? t.configurable : n.configurable,
                enumerable: Ir in t ? t.enumerable : n.enumerable,
                writable: !1,
              }));
          }
          return Tr(e, r, t);
        }
      : Tr
    : function (e, r, t) {
        if ((jr(e), (r = _r(r)), jr(t), kr))
          try {
            return Tr(e, r, t);
          } catch (e) {}
        if ('get' in t || 'set' in t) throw Er('Accessors not supported');
        return 'value' in t && (e[r] = t.value), e;
      };
  var Fr = br,
    Rr = b,
    Mr = c
      ? function (e, r, t) {
          return Fr.f(e, r, Rr(1, t));
        }
      : function (e, r, t) {
          return (e[r] = t), e;
        },
    Nr = { exports: {} },
    Dr = c,
    Jr = Te,
    Br = Function.prototype,
    Wr = Dr && Object.getOwnPropertyDescriptor,
    Lr = Jr(Br, 'name'),
    Vr = {
      EXISTS: Lr,
      PROPER: Lr && 'something' === function () {}.name,
      CONFIGURABLE: Lr && (!Dr || (Dr && Wr(Br, 'name').configurable)),
    },
    zr = D,
    Ur = Se,
    $r = S(Function.toString);
  zr(Ur.inspectSource) ||
    (Ur.inspectSource = function (e) {
      return $r(e);
    });
  var Gr,
    Hr,
    Kr,
    Xr = Ur.inspectSource,
    Yr = D,
    qr = Xr,
    Qr = t.WeakMap,
    Zr = Yr(Qr) && /native code/.test(qr(Qr)),
    et = be.exports,
    rt = Fe,
    tt = et('keys'),
    nt = function (e) {
      return tt[e] || (tt[e] = rt(e));
    },
    ot = {},
    ct = Zr,
    it = t,
    at = S,
    ut = B,
    st = Mr,
    lt = Te,
    ft = Se,
    dt = nt,
    pt = ot,
    gt = 'Object already initialized',
    vt = it.TypeError,
    bt = it.WeakMap;
  if (ct || ft.state) {
    var ht = ft.state || (ft.state = new bt()),
      yt = at(ht.get),
      mt = at(ht.has),
      wt = at(ht.set);
    (Gr = function (e, r) {
      if (mt(ht, e)) throw new vt(gt);
      return (r.facade = e), wt(ht, e, r), r;
    }),
      (Hr = function (e) {
        return yt(ht, e) || {};
      }),
      (Kr = function (e) {
        return mt(ht, e);
      });
  } else {
    var Ot = dt('state');
    (pt[Ot] = !0),
      (Gr = function (e, r) {
        if (lt(e, Ot)) throw new vt(gt);
        return (r.facade = e), st(e, Ot, r), r;
      }),
      (Hr = function (e) {
        return lt(e, Ot) ? e[Ot] : {};
      }),
      (Kr = function (e) {
        return lt(e, Ot);
      });
  }
  var St = {
      set: Gr,
      get: Hr,
      has: Kr,
      enforce: function (e) {
        return Kr(e) ? Hr(e) : Gr(e, {});
      },
      getterFor: function (e) {
        return function (r) {
          var t;
          if (!ut(r) || (t = Hr(r)).type !== e)
            throw vt('Incompatible receiver, ' + e + ' required');
          return t;
        };
      },
    },
    kt = o,
    xt = D,
    jt = Te,
    _t = c,
    Et = Vr.CONFIGURABLE,
    Tt = Xr,
    At = St.enforce,
    It = St.get,
    Ct = Object.defineProperty,
    Pt =
      _t &&
      !kt(function () {
        return 8 !== Ct(function () {}, 'length', { value: 8 }).length;
      }),
    Ft = String(String).split('String'),
    Rt = (Nr.exports = function (e, r, t) {
      'Symbol(' === String(r).slice(0, 7) &&
        (r = '[' + String(r).replace(/^Symbol\(([^)]*)\)/, '$1') + ']'),
        t && t.getter && (r = 'get ' + r),
        t && t.setter && (r = 'set ' + r),
        (!jt(e, 'name') || (Et && e.name !== r)) &&
          (_t ? Ct(e, 'name', { value: r, configurable: !0 }) : (e.name = r)),
        Pt &&
          t &&
          jt(t, 'arity') &&
          e.length !== t.arity &&
          Ct(e, 'length', { value: t.arity });
      try {
        t && jt(t, 'constructor') && t.constructor
          ? _t && Ct(e, 'prototype', { writable: !1 })
          : e.prototype && (e.prototype = void 0);
      } catch (e) {}
      var n = At(e);
      return (
        jt(n, 'source') || (n.source = Ft.join('string' == typeof r ? r : '')),
        e
      );
    });
  Function.prototype.toString = Rt(function () {
    return (xt(this) && It(this).source) || Tt(this);
  }, 'toString');
  var Mt = D,
    Nt = br,
    Dt = Nr.exports,
    Jt = me,
    Bt = function (e, r, t, n) {
      n || (n = {});
      var o = n.enumerable,
        c = void 0 !== n.name ? n.name : r;
      if ((Mt(t) && Dt(t, c, n), n.global)) o ? (e[r] = t) : Jt(r, t);
      else {
        try {
          n.unsafe ? e[r] && (o = !0) : delete e[r];
        } catch (e) {}
        o
          ? (e[r] = t)
          : Nt.f(e, r, {
              value: t,
              enumerable: !1,
              configurable: !n.nonConfigurable,
              writable: !n.nonWritable,
            });
      }
      return e;
    },
    Wt = {},
    Lt = Math.ceil,
    Vt = Math.floor,
    zt =
      Math.trunc ||
      function (e) {
        var r = +e;
        return (r > 0 ? Vt : Lt)(r);
      },
    Ut = function (e) {
      var r = +e;
      return r != r || 0 === r ? 0 : zt(r);
    },
    $t = Ut,
    Gt = Math.max,
    Ht = Math.min,
    Kt = Ut,
    Xt = Math.min,
    Yt = function (e) {
      return e > 0 ? Xt(Kt(e), 9007199254740991) : 0;
    },
    qt = Yt,
    Qt = N,
    Zt = function (e, r) {
      var t = $t(e);
      return t < 0 ? Gt(t + r, 0) : Ht(t, r);
    },
    en = function (e) {
      return qt(e.length);
    },
    rn = function (e) {
      return function (r, t, n) {
        var o,
          c = Qt(r),
          i = en(c),
          a = Zt(n, i);
        if (e && t != t) {
          for (; i > a; ) if ((o = c[a++]) != o) return !0;
        } else
          for (; i > a; a++)
            if ((e || a in c) && c[a] === t) return e || a || 0;
        return !e && -1;
      };
    },
    tn = { includes: rn(!0), indexOf: rn(!1) },
    nn = Te,
    on = N,
    cn = tn.indexOf,
    an = ot,
    un = S([].push),
    sn = function (e, r) {
      var t,
        n = on(e),
        o = 0,
        c = [];
      for (t in n) !nn(an, t) && nn(n, t) && un(c, t);
      for (; r.length > o; ) nn(n, (t = r[o++])) && (~cn(c, t) || un(c, t));
      return c;
    },
    ln = [
      'constructor',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf',
    ],
    fn = sn,
    dn = ln.concat('length', 'prototype');
  Wt.f =
    Object.getOwnPropertyNames ||
    function (e) {
      return fn(e, dn);
    };
  var pn = {};
  pn.f = Object.getOwnPropertySymbols;
  var gn = z,
    vn = Wt,
    bn = pn,
    hn = Or,
    yn = S([].concat),
    mn =
      gn('Reflect', 'ownKeys') ||
      function (e) {
        var r = vn.f(hn(e)),
          t = bn.f;
        return t ? yn(r, t(e)) : r;
      },
    wn = Te,
    On = mn,
    Sn = n,
    kn = br,
    xn = o,
    jn = D,
    _n = /#|\.prototype\./,
    En = function (e, r) {
      var t = An[Tn(e)];
      return t == Cn || (t != In && (jn(r) ? xn(r) : !!r));
    },
    Tn = (En.normalize = function (e) {
      return String(e).replace(_n, '.').toLowerCase();
    }),
    An = (En.data = {}),
    In = (En.NATIVE = 'N'),
    Cn = (En.POLYFILL = 'P'),
    Pn = En,
    Fn = t,
    Rn = n.f,
    Mn = Mr,
    Nn = Bt,
    Dn = me,
    Jn = function (e, r, t) {
      for (var n = On(r), o = kn.f, c = Sn.f, i = 0; i < n.length; i++) {
        var a = n[i];
        wn(e, a) || (t && wn(t, a)) || o(e, a, c(r, a));
      }
    },
    Bn = Pn,
    Wn = function (e, r) {
      var t,
        n,
        o,
        c,
        i,
        a = e.target,
        u = e.global,
        s = e.stat;
      if ((t = u ? Fn : s ? Fn[a] || Dn(a, {}) : (Fn[a] || {}).prototype))
        for (n in r) {
          if (
            ((c = r[n]),
            (o = e.dontCallGetSet ? (i = Rn(t, n)) && i.value : t[n]),
            !Bn(u ? n : a + (s ? '.' : '#') + n, e.forced) && void 0 !== o)
          ) {
            if (typeof c == typeof o) continue;
            Jn(c, o);
          }
          (e.sham || (o && o.sham)) && Mn(c, 'sham', !0), Nn(t, n, c, e);
        }
    },
    Ln = {};
  Ln[Ue('toStringTag')] = 'z';
  var Vn = '[object z]' === String(Ln),
    zn = D,
    Un = _,
    $n = Ue('toStringTag'),
    Gn = Object,
    Hn =
      'Arguments' ==
      Un(
        (function () {
          return arguments;
        })(),
      ),
    Kn = Vn
      ? Un
      : function (e) {
          var r, t, n;
          return void 0 === e
            ? 'Undefined'
            : null === e
            ? 'Null'
            : 'string' ==
              typeof (t = (function (e, r) {
                try {
                  return e[r];
                } catch (e) {}
              })((r = Gn(e)), $n))
            ? t
            : Hn
            ? Un(r)
            : 'Object' == (n = Un(r)) && zn(r.callee)
            ? 'Arguments'
            : n;
        },
    Xn = String,
    Yn = function (e) {
      if ('Symbol' === Kn(e))
        throw TypeError('Cannot convert a Symbol value to a string');
      return Xn(e);
    },
    qn = Or,
    Qn = o,
    Zn = t.RegExp,
    eo = Qn(function () {
      var e = Zn('a', 'y');
      return (e.lastIndex = 2), null != e.exec('abcd');
    }),
    ro =
      eo ||
      Qn(function () {
        return !Zn('a', 'y').sticky;
      }),
    to = {
      BROKEN_CARET:
        eo ||
        Qn(function () {
          var e = Zn('^r', 'gy');
          return (e.lastIndex = 2), null != e.exec('str');
        }),
      MISSED_STICKY: ro,
      UNSUPPORTED_Y: eo,
    },
    no = {},
    oo = sn,
    co = ln,
    io =
      Object.keys ||
      function (e) {
        return oo(e, co);
      },
    ao = c,
    uo = hr,
    so = br,
    lo = Or,
    fo = N,
    po = io;
  no.f =
    ao && !uo
      ? Object.defineProperties
      : function (e, r) {
          lo(e);
          for (var t, n = fo(r), o = po(r), c = o.length, i = 0; c > i; )
            so.f(e, (t = o[i++]), n[t]);
          return e;
        };
  var go,
    vo = z('document', 'documentElement'),
    bo = Or,
    ho = no,
    yo = ln,
    mo = ot,
    wo = vo,
    Oo = or,
    So = nt('IE_PROTO'),
    ko = function () {},
    xo = function (e) {
      return '<script>' + e + '</' + 'script>';
    },
    jo = function (e) {
      e.write(xo('')), e.close();
      var r = e.parentWindow.Object;
      return (e = null), r;
    },
    _o = function () {
      try {
        go = new ActiveXObject('htmlfile');
      } catch (e) {}
      var e, r;
      _o =
        'undefined' != typeof document
          ? document.domain && go
            ? jo(go)
            : (((r = Oo('iframe')).style.display = 'none'),
              wo.appendChild(r),
              (r.src = String('javascript:')),
              (e = r.contentWindow.document).open(),
              e.write(xo('document.F=Object')),
              e.close(),
              e.F)
          : jo(go);
      for (var t = yo.length; t--; ) delete _o.prototype[yo[t]];
      return _o();
    };
  mo[So] = !0;
  var Eo,
    To,
    Ao =
      Object.create ||
      function (e, r) {
        var t;
        return (
          null !== e
            ? ((ko.prototype = bo(e)),
              (t = new ko()),
              (ko.prototype = null),
              (t[So] = e))
            : (t = _o()),
          void 0 === r ? t : ho.f(t, r)
        );
      },
    Io = o,
    Co = t.RegExp,
    Po = Io(function () {
      var e = Co('.', 's');
      return !(e.dotAll && e.exec('\n') && 's' === e.flags);
    }),
    Fo = o,
    Ro = t.RegExp,
    Mo = Fo(function () {
      var e = Ro('(?<a>b)', 'g');
      return 'b' !== e.exec('b').groups.a || 'bc' !== 'b'.replace(e, '$<a>c');
    }),
    No = s,
    Do = S,
    Jo = Yn,
    Bo = function () {
      var e = qn(this),
        r = '';
      return (
        e.hasIndices && (r += 'd'),
        e.global && (r += 'g'),
        e.ignoreCase && (r += 'i'),
        e.multiline && (r += 'm'),
        e.dotAll && (r += 's'),
        e.unicode && (r += 'u'),
        e.unicodeSets && (r += 'v'),
        e.sticky && (r += 'y'),
        r
      );
    },
    Wo = to,
    Lo = be.exports,
    Vo = Ao,
    zo = St.get,
    Uo = Po,
    $o = Mo,
    Go = Lo('native-string-replace', String.prototype.replace),
    Ho = RegExp.prototype.exec,
    Ko = Ho,
    Xo = Do(''.charAt),
    Yo = Do(''.indexOf),
    qo = Do(''.replace),
    Qo = Do(''.slice),
    Zo =
      ((To = /b*/g),
      No(Ho, (Eo = /a/), 'a'),
      No(Ho, To, 'a'),
      0 !== Eo.lastIndex || 0 !== To.lastIndex),
    ec = Wo.BROKEN_CARET,
    rc = void 0 !== /()??/.exec('')[1];
  (Zo || rc || ec || Uo || $o) &&
    (Ko = function (e) {
      var r,
        t,
        n,
        o,
        c,
        i,
        a,
        u = this,
        s = zo(u),
        l = Jo(e),
        f = s.raw;
      if (f)
        return (
          (f.lastIndex = u.lastIndex),
          (r = No(Ko, f, l)),
          (u.lastIndex = f.lastIndex),
          r
        );
      var d = s.groups,
        p = ec && u.sticky,
        g = No(Bo, u),
        v = u.source,
        b = 0,
        h = l;
      if (
        (p &&
          ((g = qo(g, 'y', '')),
          -1 === Yo(g, 'g') && (g += 'g'),
          (h = Qo(l, u.lastIndex)),
          u.lastIndex > 0 &&
            (!u.multiline ||
              (u.multiline && '\n' !== Xo(l, u.lastIndex - 1))) &&
            ((v = '(?: ' + v + ')'), (h = ' ' + h), b++),
          (t = new RegExp('^(?:' + v + ')', g))),
        rc && (t = new RegExp('^' + v + '$(?!\\s)', g)),
        Zo && (n = u.lastIndex),
        (o = No(Ho, p ? t : u, h)),
        p
          ? o
            ? ((o.input = Qo(o.input, b)),
              (o[0] = Qo(o[0], b)),
              (o.index = u.lastIndex),
              (u.lastIndex += o[0].length))
            : (u.lastIndex = 0)
          : Zo && o && (u.lastIndex = u.global ? o.index + o[0].length : n),
        rc &&
          o &&
          o.length > 1 &&
          No(Go, o[0], t, function () {
            for (c = 1; c < arguments.length - 2; c++)
              void 0 === arguments[c] && (o[c] = void 0);
          }),
        o && d)
      )
        for (o.groups = i = Vo(null), c = 0; c < d.length; c++)
          i[(a = d[c])[0]] = o[a[1]];
      return o;
    });
  var tc = Ko;
  Wn({ target: 'RegExp', proto: !0, forced: /./.exec !== tc }, { exec: tc });
  var nc = S,
    oc = Bt,
    cc = tc,
    ic = o,
    ac = Ue,
    uc = Mr,
    sc = ac('species'),
    lc = RegExp.prototype,
    fc = S,
    dc = Ut,
    pc = Yn,
    gc = F,
    vc = fc(''.charAt),
    bc = fc(''.charCodeAt),
    hc = fc(''.slice),
    yc = function (e) {
      return function (r, t) {
        var n,
          o,
          c = pc(gc(r)),
          i = dc(t),
          a = c.length;
        return i < 0 || i >= a
          ? e
            ? ''
            : void 0
          : (n = bc(c, i)) < 55296 ||
            n > 56319 ||
            i + 1 === a ||
            (o = bc(c, i + 1)) < 56320 ||
            o > 57343
          ? e
            ? vc(c, i)
            : n
          : e
          ? hc(c, i, i + 2)
          : o - 56320 + ((n - 55296) << 10) + 65536;
      };
    },
    mc = { codeAt: yc(!1), charAt: yc(!0) }.charAt,
    wc = s,
    Oc = Or,
    Sc = D,
    kc = _,
    xc = tc,
    jc = TypeError,
    _c = s,
    Ec = function (e, r, t, n) {
      var o = ac(e),
        c = !ic(function () {
          var r = {};
          return (
            (r[o] = function () {
              return 7;
            }),
            7 != ''[e](r)
          );
        }),
        i =
          c &&
          !ic(function () {
            var r = !1,
              t = /a/;
            return (
              'split' === e &&
                (((t = {}).constructor = {}),
                (t.constructor[sc] = function () {
                  return t;
                }),
                (t.flags = ''),
                (t[o] = /./[o])),
              (t.exec = function () {
                return (r = !0), null;
              }),
              t[o](''),
              !r
            );
          });
      if (!c || !i || t) {
        var a = nc(/./[o]),
          u = r(o, ''[e], function (e, r, t, n, o) {
            var i = nc(e),
              u = r.exec;
            return u === cc || u === lc.exec
              ? c && !o
                ? { done: !0, value: a(r, t, n) }
                : { done: !0, value: i(t, r, n) }
              : { done: !1 };
          });
        oc(String.prototype, e, u[0]), oc(lc, o, u[1]);
      }
      n && uc(lc[o], 'sham', !0);
    },
    Tc = Or,
    Ac = Yt,
    Ic = Yn,
    Cc = F,
    Pc = fe,
    Fc = function (e, r, t) {
      return r + (t ? mc(e, r).length : 1);
    },
    Rc = function (e, r) {
      var t = e.exec;
      if (Sc(t)) {
        var n = wc(t, e, r);
        return null !== n && Oc(n), n;
      }
      if ('RegExp' === kc(e)) return wc(xc, e, r);
      throw jc('RegExp#exec called on incompatible receiver');
    };
  Ec('match', function (e, r, t) {
    return [
      function (r) {
        var t = Cc(this),
          n = null == r ? void 0 : Pc(r, e);
        return n ? _c(n, r, t) : new RegExp(r)[e](Ic(t));
      },
      function (e) {
        var n = Tc(this),
          o = Ic(e),
          c = t(r, n, o);
        if (c.done) return c.value;
        if (!n.global) return Rc(n, o);
        var i = n.unicode;
        n.lastIndex = 0;
        for (var a, u = [], s = 0; null !== (a = Rc(n, o)); ) {
          var l = Ic(a[0]);
          (u[s] = l),
            '' === l && (n.lastIndex = Fc(o, Ac(n.lastIndex), i)),
            s++;
        }
        return 0 === s ? null : u;
      },
    ];
  });
  var Mc = i,
    Nc = Function.prototype,
    Dc = Nc.apply,
    Jc = Nc.call,
    Bc =
      ('object' == typeof Reflect && Reflect.apply) ||
      (Mc
        ? Jc.bind(Dc)
        : function () {
            return Jc.apply(Dc, arguments);
          }),
    Wc = _,
    Lc =
      Array.isArray ||
      function (e) {
        return 'Array' == Wc(e);
      },
    Vc = S([].slice),
    zc = Wn,
    Uc = z,
    $c = Bc,
    Gc = s,
    Hc = S,
    Kc = o,
    Xc = Lc,
    Yc = D,
    qc = B,
    Qc = ce,
    Zc = Vc,
    ei = Z,
    ri = Uc('JSON', 'stringify'),
    ti = Hc(/./.exec),
    ni = Hc(''.charAt),
    oi = Hc(''.charCodeAt),
    ci = Hc(''.replace),
    ii = Hc((1).toString),
    ai = /[\uD800-\uDFFF]/g,
    ui = /^[\uD800-\uDBFF]$/,
    si = /^[\uDC00-\uDFFF]$/,
    li =
      !ei ||
      Kc(function () {
        var e = Uc('Symbol')();
        return (
          '[null]' != ri([e]) || '{}' != ri({ a: e }) || '{}' != ri(Object(e))
        );
      }),
    fi = Kc(function () {
      return (
        '"\\udf06\\ud834"' !== ri('\udf06\ud834') ||
        '"\\udead"' !== ri('\udead')
      );
    }),
    di = function (e, r) {
      var t = Zc(arguments),
        n = r;
      if ((qc(r) || void 0 !== e) && !Qc(e))
        return (
          Xc(r) ||
            (r = function (e, r) {
              if ((Yc(n) && (r = Gc(n, this, e, r)), !Qc(r))) return r;
            }),
          (t[1] = r),
          $c(ri, null, t)
        );
    },
    pi = function (e, r, t) {
      var n = ni(t, r - 1),
        o = ni(t, r + 1);
      return (ti(ui, e) && !ti(si, o)) || (ti(si, e) && !ti(ui, n))
        ? '\\u' + ii(oi(e, 0), 16)
        : e;
    };
  ri &&
    zc(
      { target: 'JSON', stat: !0, arity: 3, forced: li || fi },
      {
        stringify: function (e, r, t) {
          var n = Zc(arguments),
            o = $c(li ? di : ri, null, n);
          return fi && 'string' == typeof o ? ci(o, ai, pi) : o;
        },
      },
    );
  const gi = navigator.userAgent,
    vi = () =>
      gi.indexOf('android') > -1 ||
      gi.indexOf('Adr') > -1 ||
      gi.indexOf('Android') > -1,
    bi = function (e) {
      let r = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
      r && alert(JSON.stringify(e));
    },
    hi = (e) => void 0 !== e.apiConfig.debug && !0 === e.apiConfig.debug,
    yi = (e) => '[object Function]' === Object.prototype.toString.call(e);
  var mi = {
    default: e,
    call: function (e, r, t) {
      var n = '';
      'function' == typeof r && ((t = r), (r = {}));
      var o = { data: void 0 === r ? null : r };
      if ('function' == typeof t) {
        var c = 'dscb' + window.dscb++;
        (window[c] = t), (o._dscbstub = c);
      }
      return (
        (o = JSON.stringify(o)),
        window._dsbridge
          ? (n = _dsbridge.call(e, o))
          : (window._dswk || -1 != navigator.userAgent.indexOf('_dsbridge')) &&
            (n = prompt('_dsbridge=' + e, o)),
        JSON.parse(n || '{}').data
      );
    },
    register: function (e, r, t) {
      var n = t ? window._dsaf : window._dsf;
      window._dsInit ||
        ((window._dsInit = !0),
        setTimeout(function () {
          mi.call('_dsb.dsinit');
        }, 0)),
        'object' == typeof r ? (n._obs[e] = r) : (n[e] = r);
    },
    registerAsyn: function (e, r) {
      this.register(e, r, !0);
    },
    hasNativeMethod: function (e, r) {
      return this.call('_dsb.hasNativeMethod', { name: e, type: r || 'all' });
    },
    disableJavascriptDialogBlock: function (e) {
      this.call('_dsb.disableJavascriptDialogBlock', { disable: !1 !== e });
    },
  };
  !(function () {
    if (!window._dsf) {
      var e = {
        _dsf: { _obs: {} },
        _dsaf: { _obs: {} },
        dscb: 0,
        dsBridge: mi,
        close: function () {
          mi.call('_dsb.closePage');
        },
        _handleMessageFromNative: function (e) {
          var r = JSON.parse(e.data),
            t = { id: e.callbackId, complete: !0 },
            n = this._dsf[e.method],
            o = this._dsaf[e.method],
            c = function (e, n) {
              (t.data = e.apply(n, r)), mi.call('_dsb.returnValue', t);
            },
            i = function (e, n) {
              r.push(function (e, r) {
                (t.data = e),
                  (t.complete = !1 !== r),
                  mi.call('_dsb.returnValue', t);
              }),
                e.apply(n, r);
            };
          if (n) c(n, this._dsf);
          else if (o) i(o, this._dsaf);
          else {
            var a = e.method.split('.');
            if (a.length < 2) return;
            var u = a.pop(),
              s = a.join('.'),
              l = this._dsf._obs,
              f = l[s] || {},
              d = f[u];
            if (d && 'function' == typeof d) return void c(d, f);
            if (
              (d = (f = (l = this._dsaf._obs)[s] || {})[u]) &&
              'function' == typeof d
            )
              return void i(d, f);
          }
        },
      };
      for (var r in e) window[r] = e[r];
      mi.register('_hasJavascriptMethod', function (e, r) {
        var t = e.split('.');
        if (t.length < 2) return !(!_dsf[t] && !_dsaf[t]);
        e = t.pop();
        var n = t.join('.'),
          o = _dsf._obs[n] || _dsaf._obs[n];
        return o && !!o[e];
      });
    }
  })();
  var wi = mi;
  const Oi = (e) => {
      if (vi() && wi) return e(wi);
      if ((window.WebViewJavascriptBridge, window.WebViewJavascriptBridge))
        return WebViewJavascriptBridge, e(WebViewJavascriptBridge);
      if (gi.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
        if (window.WVJBCallbacks) return window.WVJBCallbacks.push(e);
        window.WVJBCallbacks = [e];
        const r = document.createElement('iframe');
        (r.style.display = 'none'),
          (r.src = 'wvjbscheme://__BRIDGE_LOADED__'),
          document.documentElement.appendChild(r),
          setTimeout(function () {
            document.documentElement.removeChild(r);
          }, 0);
      }
    },
    Si = (e) => {
      Oi(function (r) {
        vi()
          ? r.register(e.method, function (r, t) {
              e.callback && e.callback(JSON.parse(r));
            })
          : r.registerHandler(e.method, function (r, t) {
              e.callback && e.callback(r);
            });
      });
    },
    ki = (e) => {
      e.method,
        (e.data.method = e.method),
        Oi(function (r) {
          vi()
            ? (e.data,
              r.call('invoke', e.data || {}, function (r) {
                e.callback && e.callback(JSON.parse(r));
              }))
            : (r.callHandler('invoke', e.data || {}, function (r) {
                e.callback && e.callback(r);
              }),
              r.registerHandler('invoke', function (e, r) {
                r('tNative '.concat(e));
              }));
        });
    },
    xi = {
      config: (e) => {
        const r = {
            debug: !(null == e || !e.debug) && e.debug,
            appid: null != e && e.appkey ? e.appkey : e.appid,
            timestamp: null != e && e.timestamp ? e.timestamp : '',
            nonce: null != e && e.nonce ? e.nonce : '',
            signType: null != e && e.signType ? e.signType : '',
            sign: null != e && e.sign ? e.sign : '',
            jsApiList: null != e && e.jsApiList ? e.jsApiList : [],
          },
          t = {
            success: yi(e.success) ? e.success : (e) => {},
            error: yi(e.error) ? e.error : (e) => {},
          };
        var n;
        (xi.apiConfig = r),
          (n = {
            method: 'jsApiConfig',
            data: r,
            callback: (e) => {
              hi(xi) && bi(e, !1),
                e.errno
                  ? (yi(xi.readyFun) && xi.readyFun(), t.success(e))
                  : (yi(xi.errorFun) && xi.errorFun(e), t.error(e));
            },
          }),
          Oi(function (e) {
            if (vi())
              try {
                e.call(n.method, n.data || {}, function (e) {
                  n.callback && n.callback(JSON.parse(e));
                });
              } catch (e) {
                alert(e);
              }
            else
              try {
                e.callHandler(n.method, n.data || {}, function (e) {
                  n.callback && n.callback(e);
                });
              } catch (e) {
                alert(e);
              }
          });
      },
      ready: (e) => {
        xi.readyFun = e;
      },
      error: (e) => {
        xi.errorFun = e;
      },
      downloadFile: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = { error: yi(e.error) ? e.error : (e) => {} };
        if (
          void 0 === (null == e ? void 0 : e.data) ||
          '' === e.data ||
          null === e.data
        )
          return void alert('\u5165\u53c2\u4e0d\u80fd\u4e3a\u7a7a');
        const { data: t } = e;
        (void 0 !== t.url && '' !== t.url) ||
          r.error({ errno: 1e4, message: '\u94fe\u63a5\u65e0\u6548' }),
          ki({
            method: 'downloadFile',
            data: t,
            callback: (e) => {
              hi(xi) && bi(e, !1),
                e.errno ? r.success && r.success(e) : r.error && r.error(e);
            },
          });
      },
      increaseBrightness: (e) => {
        const r = { error: yi(e.error) ? e.error : (e) => {} };
        if (
          void 0 === (null == e ? void 0 : e.data) ||
          '' === e.data ||
          null === e.data
        )
          return void alert('\u5165\u53c2\u4e0d\u80fd\u4e3a\u7a7a');
        const { data: t } = e,
          { brightness: n } = t;
        ('number' != typeof n || n < 0.1 || n > 1) &&
          r.error({
            errno: 1e4,
            message: '\u4eae\u5ea6\u53c2\u6570\u4e0d\u6b63\u786e',
          }),
          ki({ method: 'increaseBrightness', data: t });
      },
      getCurrentVersion: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = {
          success: yi(e.success) ? e.success : (e) => {},
          error: yi(e.error) ? e.error : (e) => {},
        };
        ki({
          method: 'getCurrentVersion',
          data: e,
          callback: (e) => {
            e.errno ? r.success && r.success(e) : r.error && r.error(e);
          },
        });
      },
      getDeviceToken: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = {
          success: yi(e.success) ? e.success : (e) => {},
          error: yi(e.error) ? e.error : (e) => {},
        };
        ki({
          method: 'getDeviceToken',
          data: e,
          callback: (e) => {
            e.errno ? r.success && r.success(e) : r.error && r.error(e);
          },
        });
      },
      getJdTicket: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = {
          success: yi(e.success) ? e.success : (e) => {},
          error: yi(e.error) ? e.error : (e) => {},
        };
        ki({
          method: 'getJdTicket',
          data: e,
          callback: (e) => {
            e.errno ? r.success && r.success(e) : r.error && r.error(e);
          },
        });
      },
      navBarMode: (e) => {
        const r = { error: yi(e.error) ? e.error : (e) => {} };
        if (
          void 0 === (null == e ? void 0 : e.data) ||
          '' === e.data ||
          null === e.data
        )
          return void alert('\u5165\u53c2\u4e0d\u80fd\u4e3a\u7a7a');
        const { data: t } = e,
          { mode: n } = t;
        n || r.error({ errno: 1e4, message: '\u53c2\u6570\u4e0d\u6b63\u786e' }),
          ki({ method: 'navBarMode', data: t });
      },
      openSingleWeb: (e) => {
        const r = { error: yi(e.error) ? e.error : (e) => {} };
        if (
          void 0 === (null == e ? void 0 : e.data) ||
          '' === e.data ||
          null === e.data
        )
          return void alert('\u5165\u53c2\u4e0d\u80fd\u4e3a\u7a7a');
        const { data: t } = e,
          { url: n, mode: o, title: c, bgColor: i } = t;
        (o && n) ||
          r.error({ errno: 1e4, message: '\u53c2\u6570\u4e0d\u5408\u6cd5' }),
          ki({ method: 'openSingleWeb', data: t });
      },
      openTinyApp: (e) => {
        const r = { error: yi(e.error) ? e.error : (e) => {} };
        if (
          void 0 === (null == e ? void 0 : e.data) ||
          '' === e.data ||
          null === e.data
        )
          return void alert('\u5165\u53c2\u4e0d\u80fd\u4e3a\u7a7a');
        const { data: t } = e,
          { id: n, param: o } = t;
        n || r.error({ errno: 1e4, message: '\u53c2\u6570\u4e0d\u5408\u6cd5' }),
          ki({ method: 'openTinyApp', data: t });
      },
      closeSingleWeb: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = {
          success: yi(e.success) ? e.success : (e) => {},
          error: yi(e.error) ? e.error : (e) => {},
        };
        ki({
          method: 'closeSingleWeb',
          data: {},
          callback: (e) => {
            hi(xi) && bi(e, !1),
              e.errno ? r.success && r.success(e) : r.error && r.error(e);
          },
        });
      },
      getTerminalType: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = {
          success: yi(e.success) ? e.success : (e) => {},
          error: yi(e.error) ? e.error : (e) => {},
        };
        ki({
          method: 'getTerminalType',
          data: e,
          callback: (e) => {
            e.errno ? r.success && r.success(e) : r.error && r.error(e);
          },
        });
      },
      setupPullRefresh: (e) => {
        const r = { error: yi(e.error) ? e.error : (e) => {} };
        if (
          void 0 === (null == e ? void 0 : e.data) ||
          '' === e.data ||
          null === e.data
        )
          return void alert('\u5165\u53c2\u4e0d\u80fd\u4e3a\u7a7a');
        const { data: t } = e,
          { enable: n } = t;
        (!n || ('0' !== n && '1' !== n)) &&
          r.error({ errno: 1e4, message: '\u53c2\u6570\u4e0d\u6b63\u786e' }),
          ki({ method: 'setupPullRefresh', data: t });
      },
      fetchUsedService: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = {
          success: yi(e.success) ? e.success : (e) => {},
          error: yi(e.error) ? e.error : (e) => {},
        };
        ki({
          method: 'fetchUsedService',
          data: e,
          callback: (e) => {
            e.errno ? r.success && r.success(e) : r.error && r.error(e);
          },
        });
      },
      openModule: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        Si({
          method: 'successOpenModule',
          callback: yi(e.success) ? e.success : (e) => {},
        }),
          Si({
            method: 'cancelOpenModule',
            callback: yi(e.cancel) ? e.cancel : (e) => {},
          }),
          Si({
            method: 'errorOpenModule',
            callback: yi(e.error) ? e.error : (e) => {},
          }),
          ki({ method: 'openModule', data: e, callback: (e) => {} });
      },
      fetchAccessToken: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        const r = {
          success: yi(e.success) ? e.success : (e) => {},
          error: yi(e.error) ? e.error : (e) => {},
        };
        ki({
          method: 'fetchAccessToken',
          data: e,
          callback: (e) => {
            e.errno ? r.success && r.success(e) : r.error && r.error(e);
          },
        });
      },
      refreshAccessToken: function () {
        let e =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
        Si({
          method: 'successRefreshAccessToken',
          callback: yi(e.success) ? e.success : (e) => {},
        }),
          Si({
            method: 'cancelRefreshAccessToken',
            callback: yi(e.cancel) ? e.cancel : (e) => {},
          }),
          Si({
            method: 'failRefreshAccessToken',
            callback: yi(e.error) ? e.error : (e) => {},
          }),
          ki({ method: 'refreshAccessToken', data: e, callback: (e) => {} });
      },
    };
  return xi;
});

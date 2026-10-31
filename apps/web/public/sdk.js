var Je = Object.defineProperty;
var Ge = (a, e, t) => e in a ? Je(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var w = (a, e, t) => Ge(a, typeof e != "symbol" ? e + "" : e, t);
var b;
(function(a) {
  a.assertEqual = (i) => {
  };
  function e(i) {
  }
  a.assertIs = e;
  function t(i) {
    throw new Error();
  }
  a.assertNever = t, a.arrayToEnum = (i) => {
    const n = {};
    for (const r of i)
      n[r] = r;
    return n;
  }, a.getValidEnumValues = (i) => {
    const n = a.objectKeys(i).filter((o) => typeof i[i[o]] != "number"), r = {};
    for (const o of n)
      r[o] = i[o];
    return a.objectValues(r);
  }, a.objectValues = (i) => a.objectKeys(i).map(function(n) {
    return i[n];
  }), a.objectKeys = typeof Object.keys == "function" ? (i) => Object.keys(i) : (i) => {
    const n = [];
    for (const r in i)
      Object.prototype.hasOwnProperty.call(i, r) && n.push(r);
    return n;
  }, a.find = (i, n) => {
    for (const r of i)
      if (n(r))
        return r;
  }, a.isInteger = typeof Number.isInteger == "function" ? (i) => Number.isInteger(i) : (i) => typeof i == "number" && Number.isFinite(i) && Math.floor(i) === i;
  function s(i, n = " | ") {
    return i.map((r) => typeof r == "string" ? `'${r}'` : r).join(n);
  }
  a.joinValues = s, a.jsonStringifyReplacer = (i, n) => typeof n == "bigint" ? n.toString() : n;
})(b || (b = {}));
var we;
(function(a) {
  a.mergeShapes = (e, t) => ({
    ...e,
    ...t
    // second overwrites first
  });
})(we || (we = {}));
const l = b.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]), P = (a) => {
  switch (typeof a) {
    case "undefined":
      return l.undefined;
    case "string":
      return l.string;
    case "number":
      return Number.isNaN(a) ? l.nan : l.number;
    case "boolean":
      return l.boolean;
    case "function":
      return l.function;
    case "bigint":
      return l.bigint;
    case "symbol":
      return l.symbol;
    case "object":
      return Array.isArray(a) ? l.array : a === null ? l.null : a.then && typeof a.then == "function" && a.catch && typeof a.catch == "function" ? l.promise : typeof Map < "u" && a instanceof Map ? l.map : typeof Set < "u" && a instanceof Set ? l.set : typeof Date < "u" && a instanceof Date ? l.date : l.object;
    default:
      return l.unknown;
  }
}, d = b.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
class z extends Error {
  get errors() {
    return this.issues;
  }
  constructor(e) {
    super(), this.issues = [], this.addIssue = (s) => {
      this.issues = [...this.issues, s];
    }, this.addIssues = (s = []) => {
      this.issues = [...this.issues, ...s];
    };
    const t = new.target.prototype;
    Object.setPrototypeOf ? Object.setPrototypeOf(this, t) : this.__proto__ = t, this.name = "ZodError", this.issues = e;
  }
  format(e) {
    const t = e || function(n) {
      return n.message;
    }, s = { _errors: [] }, i = (n) => {
      for (const r of n.issues)
        if (r.code === "invalid_union")
          r.unionErrors.map(i);
        else if (r.code === "invalid_return_type")
          i(r.returnTypeError);
        else if (r.code === "invalid_arguments")
          i(r.argumentsError);
        else if (r.path.length === 0)
          s._errors.push(t(r));
        else {
          let o = s, u = 0;
          for (; u < r.path.length; ) {
            const h = r.path[u];
            u === r.path.length - 1 ? (o[h] = o[h] || { _errors: [] }, o[h]._errors.push(t(r))) : o[h] = o[h] || { _errors: [] }, o = o[h], u++;
          }
        }
    };
    return i(this), s;
  }
  static assert(e) {
    if (!(e instanceof z))
      throw new Error(`Not a ZodError: ${e}`);
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, b.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(e = (t) => t.message) {
    const t = {}, s = [];
    for (const i of this.issues)
      if (i.path.length > 0) {
        const n = i.path[0];
        t[n] = t[n] || [], t[n].push(e(i));
      } else
        s.push(e(i));
    return { formErrors: s, fieldErrors: t };
  }
  get formErrors() {
    return this.flatten();
  }
}
z.create = (a) => new z(a);
const ue = (a, e) => {
  let t;
  switch (a.code) {
    case d.invalid_type:
      a.received === l.undefined ? t = "Required" : t = `Expected ${a.expected}, received ${a.received}`;
      break;
    case d.invalid_literal:
      t = `Invalid literal value, expected ${JSON.stringify(a.expected, b.jsonStringifyReplacer)}`;
      break;
    case d.unrecognized_keys:
      t = `Unrecognized key(s) in object: ${b.joinValues(a.keys, ", ")}`;
      break;
    case d.invalid_union:
      t = "Invalid input";
      break;
    case d.invalid_union_discriminator:
      t = `Invalid discriminator value. Expected ${b.joinValues(a.options)}`;
      break;
    case d.invalid_enum_value:
      t = `Invalid enum value. Expected ${b.joinValues(a.options)}, received '${a.received}'`;
      break;
    case d.invalid_arguments:
      t = "Invalid function arguments";
      break;
    case d.invalid_return_type:
      t = "Invalid function return type";
      break;
    case d.invalid_date:
      t = "Invalid date";
      break;
    case d.invalid_string:
      typeof a.validation == "object" ? "includes" in a.validation ? (t = `Invalid input: must include "${a.validation.includes}"`, typeof a.validation.position == "number" && (t = `${t} at one or more positions greater than or equal to ${a.validation.position}`)) : "startsWith" in a.validation ? t = `Invalid input: must start with "${a.validation.startsWith}"` : "endsWith" in a.validation ? t = `Invalid input: must end with "${a.validation.endsWith}"` : b.assertNever(a.validation) : a.validation !== "regex" ? t = `Invalid ${a.validation}` : t = "Invalid";
      break;
    case d.too_small:
      a.type === "array" ? t = `Array must contain ${a.exact ? "exactly" : a.inclusive ? "at least" : "more than"} ${a.minimum} element(s)` : a.type === "string" ? t = `String must contain ${a.exact ? "exactly" : a.inclusive ? "at least" : "over"} ${a.minimum} character(s)` : a.type === "number" ? t = `Number must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${a.minimum}` : a.type === "bigint" ? t = `Number must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${a.minimum}` : a.type === "date" ? t = `Date must be ${a.exact ? "exactly equal to " : a.inclusive ? "greater than or equal to " : "greater than "}${new Date(Number(a.minimum))}` : t = "Invalid input";
      break;
    case d.too_big:
      a.type === "array" ? t = `Array must contain ${a.exact ? "exactly" : a.inclusive ? "at most" : "less than"} ${a.maximum} element(s)` : a.type === "string" ? t = `String must contain ${a.exact ? "exactly" : a.inclusive ? "at most" : "under"} ${a.maximum} character(s)` : a.type === "number" ? t = `Number must be ${a.exact ? "exactly" : a.inclusive ? "less than or equal to" : "less than"} ${a.maximum}` : a.type === "bigint" ? t = `BigInt must be ${a.exact ? "exactly" : a.inclusive ? "less than or equal to" : "less than"} ${a.maximum}` : a.type === "date" ? t = `Date must be ${a.exact ? "exactly" : a.inclusive ? "smaller than or equal to" : "smaller than"} ${new Date(Number(a.maximum))}` : t = "Invalid input";
      break;
    case d.custom:
      t = "Invalid input";
      break;
    case d.invalid_intersection_types:
      t = "Intersection results could not be merged";
      break;
    case d.not_multiple_of:
      t = `Number must be a multiple of ${a.multipleOf}`;
      break;
    case d.not_finite:
      t = "Number must be finite";
      break;
    default:
      t = e.defaultError, b.assertNever(a);
  }
  return { message: t };
};
let Ke = ue;
function Ye() {
  return Ke;
}
const Qe = (a) => {
  const { data: e, path: t, errorMaps: s, issueData: i } = a, n = [...t, ...i.path || []], r = {
    ...i,
    path: n
  };
  if (i.message !== void 0)
    return {
      ...i,
      path: n,
      message: i.message
    };
  let o = "";
  const u = s.filter((h) => !!h).slice().reverse();
  for (const h of u)
    o = h(r, { data: e, defaultError: o }).message;
  return {
    ...i,
    path: n,
    message: o
  };
};
function c(a, e) {
  const t = Ye(), s = Qe({
    issueData: e,
    data: a.data,
    path: a.path,
    errorMaps: [
      a.common.contextualErrorMap,
      // contextual error map is first priority
      a.schemaErrorMap,
      // then schema-bound map if available
      t,
      // then global override map
      t === ue ? void 0 : ue
      // then global default map
    ].filter((i) => !!i)
  });
  a.common.issues.push(s);
}
class T {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    this.value === "valid" && (this.value = "dirty");
  }
  abort() {
    this.value !== "aborted" && (this.value = "aborted");
  }
  static mergeArray(e, t) {
    const s = [];
    for (const i of t) {
      if (i.status === "aborted")
        return m;
      i.status === "dirty" && e.dirty(), s.push(i.value);
    }
    return { status: e.value, value: s };
  }
  static async mergeObjectAsync(e, t) {
    const s = [];
    for (const i of t) {
      const n = await i.key, r = await i.value;
      s.push({
        key: n,
        value: r
      });
    }
    return T.mergeObjectSync(e, s);
  }
  static mergeObjectSync(e, t) {
    const s = {};
    for (const i of t) {
      const { key: n, value: r } = i;
      if (n.status === "aborted" || r.status === "aborted")
        return m;
      n.status === "dirty" && e.dirty(), r.status === "dirty" && e.dirty(), n.value !== "__proto__" && (typeof r.value < "u" || i.alwaysSet) && (s[n.value] = r.value);
    }
    return { status: e.value, value: s };
  }
}
const m = Object.freeze({
  status: "aborted"
}), Y = (a) => ({ status: "dirty", value: a }), C = (a) => ({ status: "valid", value: a }), Se = (a) => a.status === "aborted", Te = (a) => a.status === "dirty", F = (a) => a.status === "valid", ne = (a) => typeof Promise < "u" && a instanceof Promise;
var p;
(function(a) {
  a.errToObj = (e) => typeof e == "string" ? { message: e } : e || {}, a.toString = (e) => typeof e == "string" ? e : e == null ? void 0 : e.message;
})(p || (p = {}));
class I {
  constructor(e, t, s, i) {
    this._cachedPath = [], this.parent = e, this.data = t, this._path = s, this._key = i;
  }
  get path() {
    return this._cachedPath.length || (Array.isArray(this._key) ? this._cachedPath.push(...this._path, ...this._key) : this._cachedPath.push(...this._path, this._key)), this._cachedPath;
  }
}
const Re = (a, e) => {
  if (F(e))
    return { success: !0, data: e.value };
  if (!a.common.issues.length)
    throw new Error("Validation failed but no issues detected.");
  return {
    success: !1,
    get error() {
      if (this._error)
        return this._error;
      const t = new z(a.common.issues);
      return this._error = t, this._error;
    }
  };
};
function y(a) {
  if (!a)
    return {};
  const { errorMap: e, invalid_type_error: t, required_error: s, description: i } = a;
  if (e && (t || s))
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  return e ? { errorMap: e, description: i } : { errorMap: (r, o) => {
    const { message: u } = a;
    return r.code === "invalid_enum_value" ? { message: u ?? o.defaultError } : typeof o.data > "u" ? { message: u ?? s ?? o.defaultError } : r.code !== "invalid_type" ? { message: o.defaultError } : { message: u ?? t ?? o.defaultError };
  }, description: i };
}
class x {
  get description() {
    return this._def.description;
  }
  _getType(e) {
    return P(e.data);
  }
  _getOrReturnCtx(e, t) {
    return t || {
      common: e.parent.common,
      data: e.data,
      parsedType: P(e.data),
      schemaErrorMap: this._def.errorMap,
      path: e.path,
      parent: e.parent
    };
  }
  _processInputParams(e) {
    return {
      status: new T(),
      ctx: {
        common: e.parent.common,
        data: e.data,
        parsedType: P(e.data),
        schemaErrorMap: this._def.errorMap,
        path: e.path,
        parent: e.parent
      }
    };
  }
  _parseSync(e) {
    const t = this._parse(e);
    if (ne(t))
      throw new Error("Synchronous parse encountered promise.");
    return t;
  }
  _parseAsync(e) {
    const t = this._parse(e);
    return Promise.resolve(t);
  }
  parse(e, t) {
    const s = this.safeParse(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  safeParse(e, t) {
    const s = {
      common: {
        issues: [],
        async: (t == null ? void 0 : t.async) ?? !1,
        contextualErrorMap: t == null ? void 0 : t.errorMap
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: P(e)
    }, i = this._parseSync({ data: e, path: s.path, parent: s });
    return Re(s, i);
  }
  "~validate"(e) {
    var s, i;
    const t = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: P(e)
    };
    if (!this["~standard"].async)
      try {
        const n = this._parseSync({ data: e, path: [], parent: t });
        return F(n) ? {
          value: n.value
        } : {
          issues: t.common.issues
        };
      } catch (n) {
        (i = (s = n == null ? void 0 : n.message) == null ? void 0 : s.toLowerCase()) != null && i.includes("encountered") && (this["~standard"].async = !0), t.common = {
          issues: [],
          async: !0
        };
      }
    return this._parseAsync({ data: e, path: [], parent: t }).then((n) => F(n) ? {
      value: n.value
    } : {
      issues: t.common.issues
    });
  }
  async parseAsync(e, t) {
    const s = await this.safeParseAsync(e, t);
    if (s.success)
      return s.data;
    throw s.error;
  }
  async safeParseAsync(e, t) {
    const s = {
      common: {
        issues: [],
        contextualErrorMap: t == null ? void 0 : t.errorMap,
        async: !0
      },
      path: (t == null ? void 0 : t.path) || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data: e,
      parsedType: P(e)
    }, i = this._parse({ data: e, path: s.path, parent: s }), n = await (ne(i) ? i : Promise.resolve(i));
    return Re(s, n);
  }
  refine(e, t) {
    const s = (i) => typeof t == "string" || typeof t > "u" ? { message: t } : typeof t == "function" ? t(i) : t;
    return this._refinement((i, n) => {
      const r = e(i), o = () => n.addIssue({
        code: d.custom,
        ...s(i)
      });
      return typeof Promise < "u" && r instanceof Promise ? r.then((u) => u ? !0 : (o(), !1)) : r ? !0 : (o(), !1);
    });
  }
  refinement(e, t) {
    return this._refinement((s, i) => e(s) ? !0 : (i.addIssue(typeof t == "function" ? t(s, i) : t), !1));
  }
  _refinement(e) {
    return new J({
      schema: this,
      typeName: g.ZodEffects,
      effect: { type: "refinement", refinement: e }
    });
  }
  superRefine(e) {
    return this._refinement(e);
  }
  constructor(e) {
    this.spa = this.safeParseAsync, this._def = e, this.parse = this.parse.bind(this), this.safeParse = this.safeParse.bind(this), this.parseAsync = this.parseAsync.bind(this), this.safeParseAsync = this.safeParseAsync.bind(this), this.spa = this.spa.bind(this), this.refine = this.refine.bind(this), this.refinement = this.refinement.bind(this), this.superRefine = this.superRefine.bind(this), this.optional = this.optional.bind(this), this.nullable = this.nullable.bind(this), this.nullish = this.nullish.bind(this), this.array = this.array.bind(this), this.promise = this.promise.bind(this), this.or = this.or.bind(this), this.and = this.and.bind(this), this.transform = this.transform.bind(this), this.brand = this.brand.bind(this), this.default = this.default.bind(this), this.catch = this.catch.bind(this), this.describe = this.describe.bind(this), this.pipe = this.pipe.bind(this), this.readonly = this.readonly.bind(this), this.isNullable = this.isNullable.bind(this), this.isOptional = this.isOptional.bind(this), this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (t) => this["~validate"](t)
    };
  }
  optional() {
    return L.create(this, this._def);
  }
  nullable() {
    return G.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return $.create(this);
  }
  promise() {
    return ce.create(this, this._def);
  }
  or(e) {
    return re.create([this, e], this._def);
  }
  and(e) {
    return oe.create(this, e, this._def);
  }
  transform(e) {
    return new J({
      ...y(this._def),
      schema: this,
      typeName: g.ZodEffects,
      effect: { type: "transform", transform: e }
    });
  }
  default(e) {
    const t = typeof e == "function" ? e : () => e;
    return new me({
      ...y(this._def),
      innerType: this,
      defaultValue: t,
      typeName: g.ZodDefault
    });
  }
  brand() {
    return new kt({
      typeName: g.ZodBranded,
      type: this,
      ...y(this._def)
    });
  }
  catch(e) {
    const t = typeof e == "function" ? e : () => e;
    return new ye({
      ...y(this._def),
      innerType: this,
      catchValue: t,
      typeName: g.ZodCatch
    });
  }
  describe(e) {
    const t = this.constructor;
    return new t({
      ...this._def,
      description: e
    });
  }
  pipe(e) {
    return xe.create(this, e);
  }
  readonly() {
    return ve.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
}
const et = /^c[^\s-]{8,}$/i, tt = /^[0-9a-z]+$/, st = /^[0-9A-HJKMNP-TV-Z]{26}$/i, at = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i, nt = /^[a-z0-9_-]{21}$/i, it = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, rt = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/, ot = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i, dt = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
let le;
const ct = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, lt = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/, ut = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/, ht = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, pt = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/, ft = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/, Ze = "((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))", gt = new RegExp(`^${Ze}$`);
function Pe(a) {
  let e = "[0-5]\\d";
  a.precision ? e = `${e}\\.\\d{${a.precision}}` : a.precision == null && (e = `${e}(\\.\\d+)?`);
  const t = a.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${e})${t}`;
}
function mt(a) {
  return new RegExp(`^${Pe(a)}$`);
}
function yt(a) {
  let e = `${Ze}T${Pe(a)}`;
  const t = [];
  return t.push(a.local ? "Z?" : "Z"), a.offset && t.push("([+-]\\d{2}:?\\d{2})"), e = `${e}(${t.join("|")})`, new RegExp(`^${e}$`);
}
function vt(a, e) {
  return !!((e === "v4" || !e) && ct.test(a) || (e === "v6" || !e) && ut.test(a));
}
function xt(a, e) {
  if (!it.test(a))
    return !1;
  try {
    const [t] = a.split(".");
    if (!t)
      return !1;
    const s = t.replace(/-/g, "+").replace(/_/g, "/").padEnd(t.length + (4 - t.length % 4) % 4, "="), i = JSON.parse(atob(s));
    return !(typeof i != "object" || i === null || "typ" in i && (i == null ? void 0 : i.typ) !== "JWT" || !i.alg || e && i.alg !== e);
  } catch {
    return !1;
  }
}
function bt(a, e) {
  return !!((e === "v4" || !e) && lt.test(a) || (e === "v6" || !e) && ht.test(a));
}
class j extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = String(e.data)), this._getType(e) !== l.string) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_type,
        expected: l.string,
        received: n.parsedType
      }), m;
    }
    const s = new T();
    let i;
    for (const n of this._def.checks)
      if (n.kind === "min")
        e.data.length < n.value && (i = this._getOrReturnCtx(e, i), c(i, {
          code: d.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), s.dirty());
      else if (n.kind === "max")
        e.data.length > n.value && (i = this._getOrReturnCtx(e, i), c(i, {
          code: d.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !1,
          message: n.message
        }), s.dirty());
      else if (n.kind === "length") {
        const r = e.data.length > n.value, o = e.data.length < n.value;
        (r || o) && (i = this._getOrReturnCtx(e, i), r ? c(i, {
          code: d.too_big,
          maximum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }) : o && c(i, {
          code: d.too_small,
          minimum: n.value,
          type: "string",
          inclusive: !0,
          exact: !0,
          message: n.message
        }), s.dirty());
      } else if (n.kind === "email")
        ot.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "email",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "emoji")
        le || (le = new RegExp(dt, "u")), le.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "emoji",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "uuid")
        at.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "uuid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "nanoid")
        nt.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "nanoid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "cuid")
        et.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "cuid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "cuid2")
        tt.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "cuid2",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "ulid")
        st.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
          validation: "ulid",
          code: d.invalid_string,
          message: n.message
        }), s.dirty());
      else if (n.kind === "url")
        try {
          new URL(e.data);
        } catch {
          i = this._getOrReturnCtx(e, i), c(i, {
            validation: "url",
            code: d.invalid_string,
            message: n.message
          }), s.dirty();
        }
      else n.kind === "regex" ? (n.regex.lastIndex = 0, n.regex.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "regex",
        code: d.invalid_string,
        message: n.message
      }), s.dirty())) : n.kind === "trim" ? e.data = e.data.trim() : n.kind === "includes" ? e.data.includes(n.value, n.position) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: { includes: n.value, position: n.position },
        message: n.message
      }), s.dirty()) : n.kind === "toLowerCase" ? e.data = e.data.toLowerCase() : n.kind === "toUpperCase" ? e.data = e.data.toUpperCase() : n.kind === "startsWith" ? e.data.startsWith(n.value) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: { startsWith: n.value },
        message: n.message
      }), s.dirty()) : n.kind === "endsWith" ? e.data.endsWith(n.value) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: { endsWith: n.value },
        message: n.message
      }), s.dirty()) : n.kind === "datetime" ? yt(n).test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: "datetime",
        message: n.message
      }), s.dirty()) : n.kind === "date" ? gt.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: "date",
        message: n.message
      }), s.dirty()) : n.kind === "time" ? mt(n).test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.invalid_string,
        validation: "time",
        message: n.message
      }), s.dirty()) : n.kind === "duration" ? rt.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "duration",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "ip" ? vt(e.data, n.version) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "ip",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "jwt" ? xt(e.data, n.alg) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "jwt",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "cidr" ? bt(e.data, n.version) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "cidr",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "base64" ? pt.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "base64",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : n.kind === "base64url" ? ft.test(e.data) || (i = this._getOrReturnCtx(e, i), c(i, {
        validation: "base64url",
        code: d.invalid_string,
        message: n.message
      }), s.dirty()) : b.assertNever(n);
    return { status: s.value, value: e.data };
  }
  _regex(e, t, s) {
    return this.refinement((i) => e.test(i), {
      validation: t,
      code: d.invalid_string,
      ...p.errToObj(s)
    });
  }
  _addCheck(e) {
    return new j({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  email(e) {
    return this._addCheck({ kind: "email", ...p.errToObj(e) });
  }
  url(e) {
    return this._addCheck({ kind: "url", ...p.errToObj(e) });
  }
  emoji(e) {
    return this._addCheck({ kind: "emoji", ...p.errToObj(e) });
  }
  uuid(e) {
    return this._addCheck({ kind: "uuid", ...p.errToObj(e) });
  }
  nanoid(e) {
    return this._addCheck({ kind: "nanoid", ...p.errToObj(e) });
  }
  cuid(e) {
    return this._addCheck({ kind: "cuid", ...p.errToObj(e) });
  }
  cuid2(e) {
    return this._addCheck({ kind: "cuid2", ...p.errToObj(e) });
  }
  ulid(e) {
    return this._addCheck({ kind: "ulid", ...p.errToObj(e) });
  }
  base64(e) {
    return this._addCheck({ kind: "base64", ...p.errToObj(e) });
  }
  base64url(e) {
    return this._addCheck({
      kind: "base64url",
      ...p.errToObj(e)
    });
  }
  jwt(e) {
    return this._addCheck({ kind: "jwt", ...p.errToObj(e) });
  }
  ip(e) {
    return this._addCheck({ kind: "ip", ...p.errToObj(e) });
  }
  cidr(e) {
    return this._addCheck({ kind: "cidr", ...p.errToObj(e) });
  }
  datetime(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "datetime",
      precision: null,
      offset: !1,
      local: !1,
      message: e
    }) : this._addCheck({
      kind: "datetime",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      offset: (e == null ? void 0 : e.offset) ?? !1,
      local: (e == null ? void 0 : e.local) ?? !1,
      ...p.errToObj(e == null ? void 0 : e.message)
    });
  }
  date(e) {
    return this._addCheck({ kind: "date", message: e });
  }
  time(e) {
    return typeof e == "string" ? this._addCheck({
      kind: "time",
      precision: null,
      message: e
    }) : this._addCheck({
      kind: "time",
      precision: typeof (e == null ? void 0 : e.precision) > "u" ? null : e == null ? void 0 : e.precision,
      ...p.errToObj(e == null ? void 0 : e.message)
    });
  }
  duration(e) {
    return this._addCheck({ kind: "duration", ...p.errToObj(e) });
  }
  regex(e, t) {
    return this._addCheck({
      kind: "regex",
      regex: e,
      ...p.errToObj(t)
    });
  }
  includes(e, t) {
    return this._addCheck({
      kind: "includes",
      value: e,
      position: t == null ? void 0 : t.position,
      ...p.errToObj(t == null ? void 0 : t.message)
    });
  }
  startsWith(e, t) {
    return this._addCheck({
      kind: "startsWith",
      value: e,
      ...p.errToObj(t)
    });
  }
  endsWith(e, t) {
    return this._addCheck({
      kind: "endsWith",
      value: e,
      ...p.errToObj(t)
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e,
      ...p.errToObj(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e,
      ...p.errToObj(t)
    });
  }
  length(e, t) {
    return this._addCheck({
      kind: "length",
      value: e,
      ...p.errToObj(t)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(e) {
    return this.min(1, p.errToObj(e));
  }
  trim() {
    return new j({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new j({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new j({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((e) => e.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((e) => e.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((e) => e.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((e) => e.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((e) => e.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((e) => e.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((e) => e.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((e) => e.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((e) => e.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((e) => e.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((e) => e.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((e) => e.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((e) => e.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((e) => e.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((e) => e.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((e) => e.kind === "base64url");
  }
  get minLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxLength() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
j.create = (a) => new j({
  checks: [],
  typeName: g.ZodString,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...y(a)
});
function _t(a, e) {
  const t = (a.toString().split(".")[1] || "").length, s = (e.toString().split(".")[1] || "").length, i = t > s ? t : s, n = Number.parseInt(a.toFixed(i).replace(".", "")), r = Number.parseInt(e.toFixed(i).replace(".", ""));
  return n % r / 10 ** i;
}
class X extends x {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte, this.step = this.multipleOf;
  }
  _parse(e) {
    if (this._def.coerce && (e.data = Number(e.data)), this._getType(e) !== l.number) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_type,
        expected: l.number,
        received: n.parsedType
      }), m;
    }
    let s;
    const i = new T();
    for (const n of this._def.checks)
      n.kind === "int" ? b.isInteger(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.invalid_type,
        expected: "integer",
        received: "float",
        message: n.message
      }), i.dirty()) : n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        minimum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), i.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        maximum: n.value,
        type: "number",
        inclusive: n.inclusive,
        exact: !1,
        message: n.message
      }), i.dirty()) : n.kind === "multipleOf" ? _t(e.data, n.value) !== 0 && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), i.dirty()) : n.kind === "finite" ? Number.isFinite(e.data) || (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_finite,
        message: n.message
      }), i.dirty()) : b.assertNever(n);
    return { status: i.value, value: e.data };
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, p.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, p.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, p.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, p.toString(t));
  }
  setLimit(e, t, s, i) {
    return new X({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: p.toString(i)
        }
      ]
    });
  }
  _addCheck(e) {
    return new X({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  int(e) {
    return this._addCheck({
      kind: "int",
      message: p.toString(e)
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !1,
      message: p.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !1,
      message: p.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: !0,
      message: p.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: !0,
      message: p.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: p.toString(t)
    });
  }
  finite(e) {
    return this._addCheck({
      kind: "finite",
      message: p.toString(e)
    });
  }
  safe(e) {
    return this._addCheck({
      kind: "min",
      inclusive: !0,
      value: Number.MIN_SAFE_INTEGER,
      message: p.toString(e)
    })._addCheck({
      kind: "max",
      inclusive: !0,
      value: Number.MAX_SAFE_INTEGER,
      message: p.toString(e)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
  get isInt() {
    return !!this._def.checks.find((e) => e.kind === "int" || e.kind === "multipleOf" && b.isInteger(e.value));
  }
  get isFinite() {
    let e = null, t = null;
    for (const s of this._def.checks) {
      if (s.kind === "finite" || s.kind === "int" || s.kind === "multipleOf")
        return !0;
      s.kind === "min" ? (t === null || s.value > t) && (t = s.value) : s.kind === "max" && (e === null || s.value < e) && (e = s.value);
    }
    return Number.isFinite(t) && Number.isFinite(e);
  }
}
X.create = (a) => new X({
  checks: [],
  typeName: g.ZodNumber,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...y(a)
});
class ee extends x {
  constructor() {
    super(...arguments), this.min = this.gte, this.max = this.lte;
  }
  _parse(e) {
    if (this._def.coerce)
      try {
        e.data = BigInt(e.data);
      } catch {
        return this._getInvalidInput(e);
      }
    if (this._getType(e) !== l.bigint)
      return this._getInvalidInput(e);
    let s;
    const i = new T();
    for (const n of this._def.checks)
      n.kind === "min" ? (n.inclusive ? e.data < n.value : e.data <= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_small,
        type: "bigint",
        minimum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), i.dirty()) : n.kind === "max" ? (n.inclusive ? e.data > n.value : e.data >= n.value) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.too_big,
        type: "bigint",
        maximum: n.value,
        inclusive: n.inclusive,
        message: n.message
      }), i.dirty()) : n.kind === "multipleOf" ? e.data % n.value !== BigInt(0) && (s = this._getOrReturnCtx(e, s), c(s, {
        code: d.not_multiple_of,
        multipleOf: n.value,
        message: n.message
      }), i.dirty()) : b.assertNever(n);
    return { status: i.value, value: e.data };
  }
  _getInvalidInput(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.bigint,
      received: t.parsedType
    }), m;
  }
  gte(e, t) {
    return this.setLimit("min", e, !0, p.toString(t));
  }
  gt(e, t) {
    return this.setLimit("min", e, !1, p.toString(t));
  }
  lte(e, t) {
    return this.setLimit("max", e, !0, p.toString(t));
  }
  lt(e, t) {
    return this.setLimit("max", e, !1, p.toString(t));
  }
  setLimit(e, t, s, i) {
    return new ee({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind: e,
          value: t,
          inclusive: s,
          message: p.toString(i)
        }
      ]
    });
  }
  _addCheck(e) {
    return new ee({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  positive(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !1,
      message: p.toString(e)
    });
  }
  negative(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !1,
      message: p.toString(e)
    });
  }
  nonpositive(e) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: !0,
      message: p.toString(e)
    });
  }
  nonnegative(e) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: !0,
      message: p.toString(e)
    });
  }
  multipleOf(e, t) {
    return this._addCheck({
      kind: "multipleOf",
      value: e,
      message: p.toString(t)
    });
  }
  get minValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e;
  }
  get maxValue() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e;
  }
}
ee.create = (a) => new ee({
  checks: [],
  typeName: g.ZodBigInt,
  coerce: (a == null ? void 0 : a.coerce) ?? !1,
  ...y(a)
});
class he extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = !!e.data), this._getType(e) !== l.boolean) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.boolean,
        received: s.parsedType
      }), m;
    }
    return C(e.data);
  }
}
he.create = (a) => new he({
  typeName: g.ZodBoolean,
  coerce: (a == null ? void 0 : a.coerce) || !1,
  ...y(a)
});
class ie extends x {
  _parse(e) {
    if (this._def.coerce && (e.data = new Date(e.data)), this._getType(e) !== l.date) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_type,
        expected: l.date,
        received: n.parsedType
      }), m;
    }
    if (Number.isNaN(e.data.getTime())) {
      const n = this._getOrReturnCtx(e);
      return c(n, {
        code: d.invalid_date
      }), m;
    }
    const s = new T();
    let i;
    for (const n of this._def.checks)
      n.kind === "min" ? e.data.getTime() < n.value && (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.too_small,
        message: n.message,
        inclusive: !0,
        exact: !1,
        minimum: n.value,
        type: "date"
      }), s.dirty()) : n.kind === "max" ? e.data.getTime() > n.value && (i = this._getOrReturnCtx(e, i), c(i, {
        code: d.too_big,
        message: n.message,
        inclusive: !0,
        exact: !1,
        maximum: n.value,
        type: "date"
      }), s.dirty()) : b.assertNever(n);
    return {
      status: s.value,
      value: new Date(e.data.getTime())
    };
  }
  _addCheck(e) {
    return new ie({
      ...this._def,
      checks: [...this._def.checks, e]
    });
  }
  min(e, t) {
    return this._addCheck({
      kind: "min",
      value: e.getTime(),
      message: p.toString(t)
    });
  }
  max(e, t) {
    return this._addCheck({
      kind: "max",
      value: e.getTime(),
      message: p.toString(t)
    });
  }
  get minDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "min" && (e === null || t.value > e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
  get maxDate() {
    let e = null;
    for (const t of this._def.checks)
      t.kind === "max" && (e === null || t.value < e) && (e = t.value);
    return e != null ? new Date(e) : null;
  }
}
ie.create = (a) => new ie({
  checks: [],
  coerce: (a == null ? void 0 : a.coerce) || !1,
  typeName: g.ZodDate,
  ...y(a)
});
class Ce extends x {
  _parse(e) {
    if (this._getType(e) !== l.symbol) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.symbol,
        received: s.parsedType
      }), m;
    }
    return C(e.data);
  }
}
Ce.create = (a) => new Ce({
  typeName: g.ZodSymbol,
  ...y(a)
});
class Ee extends x {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.undefined,
        received: s.parsedType
      }), m;
    }
    return C(e.data);
  }
}
Ee.create = (a) => new Ee({
  typeName: g.ZodUndefined,
  ...y(a)
});
class Ae extends x {
  _parse(e) {
    if (this._getType(e) !== l.null) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.null,
        received: s.parsedType
      }), m;
    }
    return C(e.data);
  }
}
Ae.create = (a) => new Ae({
  typeName: g.ZodNull,
  ...y(a)
});
class pe extends x {
  constructor() {
    super(...arguments), this._any = !0;
  }
  _parse(e) {
    return C(e.data);
  }
}
pe.create = (a) => new pe({
  typeName: g.ZodAny,
  ...y(a)
});
class $e extends x {
  constructor() {
    super(...arguments), this._unknown = !0;
  }
  _parse(e) {
    return C(e.data);
  }
}
$e.create = (a) => new $e({
  typeName: g.ZodUnknown,
  ...y(a)
});
class B extends x {
  _parse(e) {
    const t = this._getOrReturnCtx(e);
    return c(t, {
      code: d.invalid_type,
      expected: l.never,
      received: t.parsedType
    }), m;
  }
}
B.create = (a) => new B({
  typeName: g.ZodNever,
  ...y(a)
});
class Ie extends x {
  _parse(e) {
    if (this._getType(e) !== l.undefined) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.void,
        received: s.parsedType
      }), m;
    }
    return C(e.data);
  }
}
Ie.create = (a) => new Ie({
  typeName: g.ZodVoid,
  ...y(a)
});
class $ extends x {
  _parse(e) {
    const { ctx: t, status: s } = this._processInputParams(e), i = this._def;
    if (t.parsedType !== l.array)
      return c(t, {
        code: d.invalid_type,
        expected: l.array,
        received: t.parsedType
      }), m;
    if (i.exactLength !== null) {
      const r = t.data.length > i.exactLength.value, o = t.data.length < i.exactLength.value;
      (r || o) && (c(t, {
        code: r ? d.too_big : d.too_small,
        minimum: o ? i.exactLength.value : void 0,
        maximum: r ? i.exactLength.value : void 0,
        type: "array",
        inclusive: !0,
        exact: !0,
        message: i.exactLength.message
      }), s.dirty());
    }
    if (i.minLength !== null && t.data.length < i.minLength.value && (c(t, {
      code: d.too_small,
      minimum: i.minLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: i.minLength.message
    }), s.dirty()), i.maxLength !== null && t.data.length > i.maxLength.value && (c(t, {
      code: d.too_big,
      maximum: i.maxLength.value,
      type: "array",
      inclusive: !0,
      exact: !1,
      message: i.maxLength.message
    }), s.dirty()), t.common.async)
      return Promise.all([...t.data].map((r, o) => i.type._parseAsync(new I(t, r, t.path, o)))).then((r) => T.mergeArray(s, r));
    const n = [...t.data].map((r, o) => i.type._parseSync(new I(t, r, t.path, o)));
    return T.mergeArray(s, n);
  }
  get element() {
    return this._def.type;
  }
  min(e, t) {
    return new $({
      ...this._def,
      minLength: { value: e, message: p.toString(t) }
    });
  }
  max(e, t) {
    return new $({
      ...this._def,
      maxLength: { value: e, message: p.toString(t) }
    });
  }
  length(e, t) {
    return new $({
      ...this._def,
      exactLength: { value: e, message: p.toString(t) }
    });
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
$.create = (a, e) => new $({
  type: a,
  minLength: null,
  maxLength: null,
  exactLength: null,
  typeName: g.ZodArray,
  ...y(e)
});
function W(a) {
  if (a instanceof k) {
    const e = {};
    for (const t in a.shape) {
      const s = a.shape[t];
      e[t] = L.create(W(s));
    }
    return new k({
      ...a._def,
      shape: () => e
    });
  } else return a instanceof $ ? new $({
    ...a._def,
    type: W(a.element)
  }) : a instanceof L ? L.create(W(a.unwrap())) : a instanceof G ? G.create(W(a.unwrap())) : a instanceof V ? V.create(a.items.map((e) => W(e))) : a;
}
class k extends x {
  constructor() {
    super(...arguments), this._cached = null, this.nonstrict = this.passthrough, this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const e = this._def.shape(), t = b.objectKeys(e);
    return this._cached = { shape: e, keys: t }, this._cached;
  }
  _parse(e) {
    if (this._getType(e) !== l.object) {
      const h = this._getOrReturnCtx(e);
      return c(h, {
        code: d.invalid_type,
        expected: l.object,
        received: h.parsedType
      }), m;
    }
    const { status: s, ctx: i } = this._processInputParams(e), { shape: n, keys: r } = this._getCached(), o = [];
    if (!(this._def.catchall instanceof B && this._def.unknownKeys === "strip"))
      for (const h in i.data)
        r.includes(h) || o.push(h);
    const u = [];
    for (const h of r) {
      const v = n[h], A = i.data[h];
      u.push({
        key: { status: "valid", value: h },
        value: v._parse(new I(i, A, i.path, h)),
        alwaysSet: h in i.data
      });
    }
    if (this._def.catchall instanceof B) {
      const h = this._def.unknownKeys;
      if (h === "passthrough")
        for (const v of o)
          u.push({
            key: { status: "valid", value: v },
            value: { status: "valid", value: i.data[v] }
          });
      else if (h === "strict")
        o.length > 0 && (c(i, {
          code: d.unrecognized_keys,
          keys: o
        }), s.dirty());
      else if (h !== "strip") throw new Error("Internal ZodObject error: invalid unknownKeys value.");
    } else {
      const h = this._def.catchall;
      for (const v of o) {
        const A = i.data[v];
        u.push({
          key: { status: "valid", value: v },
          value: h._parse(
            new I(i, A, i.path, v)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: v in i.data
        });
      }
    }
    return i.common.async ? Promise.resolve().then(async () => {
      const h = [];
      for (const v of u) {
        const A = await v.key, D = await v.value;
        h.push({
          key: A,
          value: D,
          alwaysSet: v.alwaysSet
        });
      }
      return h;
    }).then((h) => T.mergeObjectSync(s, h)) : T.mergeObjectSync(s, u);
  }
  get shape() {
    return this._def.shape();
  }
  strict(e) {
    return p.errToObj, new k({
      ...this._def,
      unknownKeys: "strict",
      ...e !== void 0 ? {
        errorMap: (t, s) => {
          var n, r;
          const i = ((r = (n = this._def).errorMap) == null ? void 0 : r.call(n, t, s).message) ?? s.defaultError;
          return t.code === "unrecognized_keys" ? {
            message: p.errToObj(e).message ?? i
          } : {
            message: i
          };
        }
      } : {}
    });
  }
  strip() {
    return new k({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new k({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(e) {
    return new k({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...e
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(e) {
    return new k({
      unknownKeys: e._def.unknownKeys,
      catchall: e._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...e._def.shape()
      }),
      typeName: g.ZodObject
    });
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(e, t) {
    return this.augment({ [e]: t });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(e) {
    return new k({
      ...this._def,
      catchall: e
    });
  }
  pick(e) {
    const t = {};
    for (const s of b.objectKeys(e))
      e[s] && this.shape[s] && (t[s] = this.shape[s]);
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  omit(e) {
    const t = {};
    for (const s of b.objectKeys(this.shape))
      e[s] || (t[s] = this.shape[s]);
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return W(this);
  }
  partial(e) {
    const t = {};
    for (const s of b.objectKeys(this.shape)) {
      const i = this.shape[s];
      e && !e[s] ? t[s] = i : t[s] = i.optional();
    }
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  required(e) {
    const t = {};
    for (const s of b.objectKeys(this.shape))
      if (e && !e[s])
        t[s] = this.shape[s];
      else {
        let n = this.shape[s];
        for (; n instanceof L; )
          n = n._def.innerType;
        t[s] = n;
      }
    return new k({
      ...this._def,
      shape: () => t
    });
  }
  keyof() {
    return Le(b.objectKeys(this.shape));
  }
}
k.create = (a, e) => new k({
  shape: () => a,
  unknownKeys: "strip",
  catchall: B.create(),
  typeName: g.ZodObject,
  ...y(e)
});
k.strictCreate = (a, e) => new k({
  shape: () => a,
  unknownKeys: "strict",
  catchall: B.create(),
  typeName: g.ZodObject,
  ...y(e)
});
k.lazycreate = (a, e) => new k({
  shape: a,
  unknownKeys: "strip",
  catchall: B.create(),
  typeName: g.ZodObject,
  ...y(e)
});
class re extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = this._def.options;
    function i(n) {
      for (const o of n)
        if (o.result.status === "valid")
          return o.result;
      for (const o of n)
        if (o.result.status === "dirty")
          return t.common.issues.push(...o.ctx.common.issues), o.result;
      const r = n.map((o) => new z(o.ctx.common.issues));
      return c(t, {
        code: d.invalid_union,
        unionErrors: r
      }), m;
    }
    if (t.common.async)
      return Promise.all(s.map(async (n) => {
        const r = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await n._parseAsync({
            data: t.data,
            path: t.path,
            parent: r
          }),
          ctx: r
        };
      })).then(i);
    {
      let n;
      const r = [];
      for (const u of s) {
        const h = {
          ...t,
          common: {
            ...t.common,
            issues: []
          },
          parent: null
        }, v = u._parseSync({
          data: t.data,
          path: t.path,
          parent: h
        });
        if (v.status === "valid")
          return v;
        v.status === "dirty" && !n && (n = { result: v, ctx: h }), h.common.issues.length && r.push(h.common.issues);
      }
      if (n)
        return t.common.issues.push(...n.ctx.common.issues), n.result;
      const o = r.map((u) => new z(u));
      return c(t, {
        code: d.invalid_union,
        unionErrors: o
      }), m;
    }
  }
  get options() {
    return this._def.options;
  }
}
re.create = (a, e) => new re({
  options: a,
  typeName: g.ZodUnion,
  ...y(e)
});
function fe(a, e) {
  const t = P(a), s = P(e);
  if (a === e)
    return { valid: !0, data: a };
  if (t === l.object && s === l.object) {
    const i = b.objectKeys(e), n = b.objectKeys(a).filter((o) => i.indexOf(o) !== -1), r = { ...a, ...e };
    for (const o of n) {
      const u = fe(a[o], e[o]);
      if (!u.valid)
        return { valid: !1 };
      r[o] = u.data;
    }
    return { valid: !0, data: r };
  } else if (t === l.array && s === l.array) {
    if (a.length !== e.length)
      return { valid: !1 };
    const i = [];
    for (let n = 0; n < a.length; n++) {
      const r = a[n], o = e[n], u = fe(r, o);
      if (!u.valid)
        return { valid: !1 };
      i.push(u.data);
    }
    return { valid: !0, data: i };
  } else return t === l.date && s === l.date && +a == +e ? { valid: !0, data: a } : { valid: !1 };
}
class oe extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), i = (n, r) => {
      if (Se(n) || Se(r))
        return m;
      const o = fe(n.value, r.value);
      return o.valid ? ((Te(n) || Te(r)) && t.dirty(), { status: t.value, value: o.data }) : (c(s, {
        code: d.invalid_intersection_types
      }), m);
    };
    return s.common.async ? Promise.all([
      this._def.left._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      }),
      this._def.right._parseAsync({
        data: s.data,
        path: s.path,
        parent: s
      })
    ]).then(([n, r]) => i(n, r)) : i(this._def.left._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }), this._def.right._parseSync({
      data: s.data,
      path: s.path,
      parent: s
    }));
  }
}
oe.create = (a, e, t) => new oe({
  left: a,
  right: e,
  typeName: g.ZodIntersection,
  ...y(t)
});
class V extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.array)
      return c(s, {
        code: d.invalid_type,
        expected: l.array,
        received: s.parsedType
      }), m;
    if (s.data.length < this._def.items.length)
      return c(s, {
        code: d.too_small,
        minimum: this._def.items.length,
        inclusive: !0,
        exact: !1,
        type: "array"
      }), m;
    !this._def.rest && s.data.length > this._def.items.length && (c(s, {
      code: d.too_big,
      maximum: this._def.items.length,
      inclusive: !0,
      exact: !1,
      type: "array"
    }), t.dirty());
    const n = [...s.data].map((r, o) => {
      const u = this._def.items[o] || this._def.rest;
      return u ? u._parse(new I(s, r, s.path, o)) : null;
    }).filter((r) => !!r);
    return s.common.async ? Promise.all(n).then((r) => T.mergeArray(t, r)) : T.mergeArray(t, n);
  }
  get items() {
    return this._def.items;
  }
  rest(e) {
    return new V({
      ...this._def,
      rest: e
    });
  }
}
V.create = (a, e) => {
  if (!Array.isArray(a))
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  return new V({
    items: a,
    typeName: g.ZodTuple,
    rest: null,
    ...y(e)
  });
};
class de extends x {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.object)
      return c(s, {
        code: d.invalid_type,
        expected: l.object,
        received: s.parsedType
      }), m;
    const i = [], n = this._def.keyType, r = this._def.valueType;
    for (const o in s.data)
      i.push({
        key: n._parse(new I(s, o, s.path, o)),
        value: r._parse(new I(s, s.data[o], s.path, o)),
        alwaysSet: o in s.data
      });
    return s.common.async ? T.mergeObjectAsync(t, i) : T.mergeObjectSync(t, i);
  }
  get element() {
    return this._def.valueType;
  }
  static create(e, t, s) {
    return t instanceof x ? new de({
      keyType: e,
      valueType: t,
      typeName: g.ZodRecord,
      ...y(s)
    }) : new de({
      keyType: j.create(),
      valueType: e,
      typeName: g.ZodRecord,
      ...y(t)
    });
  }
}
class Oe extends x {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.map)
      return c(s, {
        code: d.invalid_type,
        expected: l.map,
        received: s.parsedType
      }), m;
    const i = this._def.keyType, n = this._def.valueType, r = [...s.data.entries()].map(([o, u], h) => ({
      key: i._parse(new I(s, o, s.path, [h, "key"])),
      value: n._parse(new I(s, u, s.path, [h, "value"]))
    }));
    if (s.common.async) {
      const o = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const u of r) {
          const h = await u.key, v = await u.value;
          if (h.status === "aborted" || v.status === "aborted")
            return m;
          (h.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(h.value, v.value);
        }
        return { status: t.value, value: o };
      });
    } else {
      const o = /* @__PURE__ */ new Map();
      for (const u of r) {
        const h = u.key, v = u.value;
        if (h.status === "aborted" || v.status === "aborted")
          return m;
        (h.status === "dirty" || v.status === "dirty") && t.dirty(), o.set(h.value, v.value);
      }
      return { status: t.value, value: o };
    }
  }
}
Oe.create = (a, e, t) => new Oe({
  valueType: e,
  keyType: a,
  typeName: g.ZodMap,
  ...y(t)
});
class te extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.parsedType !== l.set)
      return c(s, {
        code: d.invalid_type,
        expected: l.set,
        received: s.parsedType
      }), m;
    const i = this._def;
    i.minSize !== null && s.data.size < i.minSize.value && (c(s, {
      code: d.too_small,
      minimum: i.minSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: i.minSize.message
    }), t.dirty()), i.maxSize !== null && s.data.size > i.maxSize.value && (c(s, {
      code: d.too_big,
      maximum: i.maxSize.value,
      type: "set",
      inclusive: !0,
      exact: !1,
      message: i.maxSize.message
    }), t.dirty());
    const n = this._def.valueType;
    function r(u) {
      const h = /* @__PURE__ */ new Set();
      for (const v of u) {
        if (v.status === "aborted")
          return m;
        v.status === "dirty" && t.dirty(), h.add(v.value);
      }
      return { status: t.value, value: h };
    }
    const o = [...s.data.values()].map((u, h) => n._parse(new I(s, u, s.path, h)));
    return s.common.async ? Promise.all(o).then((u) => r(u)) : r(o);
  }
  min(e, t) {
    return new te({
      ...this._def,
      minSize: { value: e, message: p.toString(t) }
    });
  }
  max(e, t) {
    return new te({
      ...this._def,
      maxSize: { value: e, message: p.toString(t) }
    });
  }
  size(e, t) {
    return this.min(e, t).max(e, t);
  }
  nonempty(e) {
    return this.min(1, e);
  }
}
te.create = (a, e) => new te({
  valueType: a,
  minSize: null,
  maxSize: null,
  typeName: g.ZodSet,
  ...y(e)
});
class je extends x {
  get schema() {
    return this._def.getter();
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    return this._def.getter()._parse({ data: t.data, path: t.path, parent: t });
  }
}
je.create = (a, e) => new je({
  getter: a,
  typeName: g.ZodLazy,
  ...y(e)
});
class ge extends x {
  _parse(e) {
    if (e.data !== this._def.value) {
      const t = this._getOrReturnCtx(e);
      return c(t, {
        received: t.data,
        code: d.invalid_literal,
        expected: this._def.value
      }), m;
    }
    return { status: "valid", value: e.data };
  }
  get value() {
    return this._def.value;
  }
}
ge.create = (a, e) => new ge({
  value: a,
  typeName: g.ZodLiteral,
  ...y(e)
});
function Le(a, e) {
  return new H({
    values: a,
    typeName: g.ZodEnum,
    ...y(e)
  });
}
class H extends x {
  _parse(e) {
    if (typeof e.data != "string") {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        expected: b.joinValues(s),
        received: t.parsedType,
        code: d.invalid_type
      }), m;
    }
    if (this._cache || (this._cache = new Set(this._def.values)), !this._cache.has(e.data)) {
      const t = this._getOrReturnCtx(e), s = this._def.values;
      return c(t, {
        received: t.data,
        code: d.invalid_enum_value,
        options: s
      }), m;
    }
    return C(e.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Values() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  get Enum() {
    const e = {};
    for (const t of this._def.values)
      e[t] = t;
    return e;
  }
  extract(e, t = this._def) {
    return H.create(e, {
      ...this._def,
      ...t
    });
  }
  exclude(e, t = this._def) {
    return H.create(this.options.filter((s) => !e.includes(s)), {
      ...this._def,
      ...t
    });
  }
}
H.create = Le;
class Ne extends x {
  _parse(e) {
    const t = b.getValidEnumValues(this._def.values), s = this._getOrReturnCtx(e);
    if (s.parsedType !== l.string && s.parsedType !== l.number) {
      const i = b.objectValues(t);
      return c(s, {
        expected: b.joinValues(i),
        received: s.parsedType,
        code: d.invalid_type
      }), m;
    }
    if (this._cache || (this._cache = new Set(b.getValidEnumValues(this._def.values))), !this._cache.has(e.data)) {
      const i = b.objectValues(t);
      return c(s, {
        received: s.data,
        code: d.invalid_enum_value,
        options: i
      }), m;
    }
    return C(e.data);
  }
  get enum() {
    return this._def.values;
  }
}
Ne.create = (a, e) => new Ne({
  values: a,
  typeName: g.ZodNativeEnum,
  ...y(e)
});
class ce extends x {
  unwrap() {
    return this._def.type;
  }
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    if (t.parsedType !== l.promise && t.common.async === !1)
      return c(t, {
        code: d.invalid_type,
        expected: l.promise,
        received: t.parsedType
      }), m;
    const s = t.parsedType === l.promise ? t.data : Promise.resolve(t.data);
    return C(s.then((i) => this._def.type.parseAsync(i, {
      path: t.path,
      errorMap: t.common.contextualErrorMap
    })));
  }
}
ce.create = (a, e) => new ce({
  type: a,
  typeName: g.ZodPromise,
  ...y(e)
});
class J extends x {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === g.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e), i = this._def.effect || null, n = {
      addIssue: (r) => {
        c(s, r), r.fatal ? t.abort() : t.dirty();
      },
      get path() {
        return s.path;
      }
    };
    if (n.addIssue = n.addIssue.bind(n), i.type === "preprocess") {
      const r = i.transform(s.data, n);
      if (s.common.async)
        return Promise.resolve(r).then(async (o) => {
          if (t.value === "aborted")
            return m;
          const u = await this._def.schema._parseAsync({
            data: o,
            path: s.path,
            parent: s
          });
          return u.status === "aborted" ? m : u.status === "dirty" || t.value === "dirty" ? Y(u.value) : u;
        });
      {
        if (t.value === "aborted")
          return m;
        const o = this._def.schema._parseSync({
          data: r,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? m : o.status === "dirty" || t.value === "dirty" ? Y(o.value) : o;
      }
    }
    if (i.type === "refinement") {
      const r = (o) => {
        const u = i.refinement(o, n);
        if (s.common.async)
          return Promise.resolve(u);
        if (u instanceof Promise)
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        return o;
      };
      if (s.common.async === !1) {
        const o = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), r(o.value), { status: t.value, value: o.value });
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((o) => o.status === "aborted" ? m : (o.status === "dirty" && t.dirty(), r(o.value).then(() => ({ status: t.value, value: o.value }))));
    }
    if (i.type === "transform")
      if (s.common.async === !1) {
        const r = this._def.schema._parseSync({
          data: s.data,
          path: s.path,
          parent: s
        });
        if (!F(r))
          return m;
        const o = i.transform(r.value, n);
        if (o instanceof Promise)
          throw new Error("Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.");
        return { status: t.value, value: o };
      } else
        return this._def.schema._parseAsync({ data: s.data, path: s.path, parent: s }).then((r) => F(r) ? Promise.resolve(i.transform(r.value, n)).then((o) => ({
          status: t.value,
          value: o
        })) : m);
    b.assertNever(i);
  }
}
J.create = (a, e, t) => new J({
  schema: a,
  typeName: g.ZodEffects,
  effect: e,
  ...y(t)
});
J.createWithPreprocess = (a, e, t) => new J({
  schema: e,
  effect: { type: "preprocess", transform: a },
  typeName: g.ZodEffects,
  ...y(t)
});
class L extends x {
  _parse(e) {
    return this._getType(e) === l.undefined ? C(void 0) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
L.create = (a, e) => new L({
  innerType: a,
  typeName: g.ZodOptional,
  ...y(e)
});
class G extends x {
  _parse(e) {
    return this._getType(e) === l.null ? C(null) : this._def.innerType._parse(e);
  }
  unwrap() {
    return this._def.innerType;
  }
}
G.create = (a, e) => new G({
  innerType: a,
  typeName: g.ZodNullable,
  ...y(e)
});
class me extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e);
    let s = t.data;
    return t.parsedType === l.undefined && (s = this._def.defaultValue()), this._def.innerType._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
}
me.create = (a, e) => new me({
  innerType: a,
  typeName: g.ZodDefault,
  defaultValue: typeof e.default == "function" ? e.default : () => e.default,
  ...y(e)
});
class ye extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = {
      ...t,
      common: {
        ...t.common,
        issues: []
      }
    }, i = this._def.innerType._parse({
      data: s.data,
      path: s.path,
      parent: {
        ...s
      }
    });
    return ne(i) ? i.then((n) => ({
      status: "valid",
      value: n.status === "valid" ? n.value : this._def.catchValue({
        get error() {
          return new z(s.common.issues);
        },
        input: s.data
      })
    })) : {
      status: "valid",
      value: i.status === "valid" ? i.value : this._def.catchValue({
        get error() {
          return new z(s.common.issues);
        },
        input: s.data
      })
    };
  }
  removeCatch() {
    return this._def.innerType;
  }
}
ye.create = (a, e) => new ye({
  innerType: a,
  typeName: g.ZodCatch,
  catchValue: typeof e.catch == "function" ? e.catch : () => e.catch,
  ...y(e)
});
class ze extends x {
  _parse(e) {
    if (this._getType(e) !== l.nan) {
      const s = this._getOrReturnCtx(e);
      return c(s, {
        code: d.invalid_type,
        expected: l.nan,
        received: s.parsedType
      }), m;
    }
    return { status: "valid", value: e.data };
  }
}
ze.create = (a) => new ze({
  typeName: g.ZodNaN,
  ...y(a)
});
class kt extends x {
  _parse(e) {
    const { ctx: t } = this._processInputParams(e), s = t.data;
    return this._def.type._parse({
      data: s,
      path: t.path,
      parent: t
    });
  }
  unwrap() {
    return this._def.type;
  }
}
class xe extends x {
  _parse(e) {
    const { status: t, ctx: s } = this._processInputParams(e);
    if (s.common.async)
      return (async () => {
        const n = await this._def.in._parseAsync({
          data: s.data,
          path: s.path,
          parent: s
        });
        return n.status === "aborted" ? m : n.status === "dirty" ? (t.dirty(), Y(n.value)) : this._def.out._parseAsync({
          data: n.value,
          path: s.path,
          parent: s
        });
      })();
    {
      const i = this._def.in._parseSync({
        data: s.data,
        path: s.path,
        parent: s
      });
      return i.status === "aborted" ? m : i.status === "dirty" ? (t.dirty(), {
        status: "dirty",
        value: i.value
      }) : this._def.out._parseSync({
        data: i.value,
        path: s.path,
        parent: s
      });
    }
  }
  static create(e, t) {
    return new xe({
      in: e,
      out: t,
      typeName: g.ZodPipeline
    });
  }
}
class ve extends x {
  _parse(e) {
    const t = this._def.innerType._parse(e), s = (i) => (F(i) && (i.value = Object.freeze(i.value)), i);
    return ne(t) ? t.then((i) => s(i)) : s(t);
  }
  unwrap() {
    return this._def.innerType;
  }
}
ve.create = (a, e) => new ve({
  innerType: a,
  typeName: g.ZodReadonly,
  ...y(e)
});
var g;
(function(a) {
  a.ZodString = "ZodString", a.ZodNumber = "ZodNumber", a.ZodNaN = "ZodNaN", a.ZodBigInt = "ZodBigInt", a.ZodBoolean = "ZodBoolean", a.ZodDate = "ZodDate", a.ZodSymbol = "ZodSymbol", a.ZodUndefined = "ZodUndefined", a.ZodNull = "ZodNull", a.ZodAny = "ZodAny", a.ZodUnknown = "ZodUnknown", a.ZodNever = "ZodNever", a.ZodVoid = "ZodVoid", a.ZodArray = "ZodArray", a.ZodObject = "ZodObject", a.ZodUnion = "ZodUnion", a.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", a.ZodIntersection = "ZodIntersection", a.ZodTuple = "ZodTuple", a.ZodRecord = "ZodRecord", a.ZodMap = "ZodMap", a.ZodSet = "ZodSet", a.ZodFunction = "ZodFunction", a.ZodLazy = "ZodLazy", a.ZodLiteral = "ZodLiteral", a.ZodEnum = "ZodEnum", a.ZodEffects = "ZodEffects", a.ZodNativeEnum = "ZodNativeEnum", a.ZodOptional = "ZodOptional", a.ZodNullable = "ZodNullable", a.ZodDefault = "ZodDefault", a.ZodCatch = "ZodCatch", a.ZodPromise = "ZodPromise", a.ZodBranded = "ZodBranded", a.ZodPipeline = "ZodPipeline", a.ZodReadonly = "ZodReadonly";
})(g || (g = {}));
const f = j.create, N = X.create, M = he.create, O = pe.create;
B.create;
const R = $.create, S = k.create, Be = re.create;
oe.create;
V.create;
const q = de.create, De = ge.create, U = H.create;
ce.create;
L.create;
G.create;
const be = U(["GET", "POST", "PUT", "PATCH", "DELETE"]), Me = U(["confirm", "block", "limit", "require", "role"]), wt = U([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not_in",
  "contains"
]), St = U(["voice", "docs", "compile"]), Ve = S({
  id: f().uuid().optional(),
  app_id: f().uuid().optional(),
  skill_name: f(),
  kind: Me,
  field: f().nullable().optional(),
  op: wt.nullable().optional(),
  value: O().optional(),
  message: f(),
  spoken: f().nullable().optional(),
  source: St.default("voice"),
  created_at: f().optional()
}), Tt = S({
  type: f(),
  required: M().default(!1),
  enum: R(f()).optional(),
  description: f().optional(),
  default: O().optional()
}), Ue = S({
  id: f().uuid().optional(),
  app_id: f().uuid().optional(),
  name: f().regex(/^[a-z0-9_]+$/i, "Skill name must be alphanumeric with underscores"),
  version: N().int().default(1),
  title: f(),
  description: f().optional(),
  method: be,
  path: f(),
  query_params: R(f()).default([]),
  inputs: q(Tt).default({}),
  constants: q(O()).default({}),
  outputs: q(O()).default({}),
  depends_on: R(f()).default([]),
  is_write: M().default(!1),
  verify_with: f().nullable().optional(),
  source_recording: f().uuid().nullable().optional(),
  narration: f().nullable().optional(),
  narration_metadata: S({
    source: U(["voice", "typed"]),
    words: N(),
    created_at: f().optional()
  }).nullable().optional(),
  status: U(["active", "drifted", "disabled", "at_risk"]).default("active")
});
S({
  method: be,
  path: f(),
  query: q(f()).optional(),
  requestBody: O().optional(),
  status: N().int(),
  responseBody: O().optional(),
  ts: N()
});
const Rt = S({
  from_event: N().int(),
  from_path: f(),
  to_event: N().int(),
  to_field: f(),
  value: Be([f(), N()])
});
S({
  skills: R(Ue),
  suggested_policies: R(Ve).default([])
});
S({
  skills: R(Ue),
  suggested_policies: R(Ve).default([]),
  tracer_edges: R(Rt).default([])
});
const Ct = S({
  idx: N().int(),
  skill_name: f(),
  description: f(),
  args: q(O()).default({})
}), We = S({
  steps: R(Ct),
  summary: f()
}), Et = S({
  role: U(["system", "user", "assistant", "tool"]),
  content: f().default(""),
  tool_call_id: f().optional(),
  name: f().optional()
}), At = S({
  call_id: f(),
  skill_name: f(),
  status: N().int(),
  response: O().optional()
});
S({
  app_key: f(),
  messages: R(Et),
  pending_result: At.optional()
});
const $t = S({
  type: De("tool_call"),
  call_id: f(),
  skill: f(),
  method: be.optional(),
  path: f().optional(),
  args: q(O()).default({}),
  check: S({
    allowed: M(),
    needsConfirm: M(),
    violations: R(S({
      policyId: f(),
      message: f(),
      kind: Me,
      field: f().nullable().optional()
    }))
  }),
  plan: We.optional(),
  verified: M().optional(),
  verification_note: f().optional(),
  blocked: M().optional(),
  message: f().optional()
}), It = S({
  type: De("message"),
  text: f(),
  plan: We.optional(),
  sources: R(O()).optional(),
  verified: M().optional(),
  verification_note: f().optional()
});
Be([
  $t,
  It
]);
const Ot = /token|secret|password|authorization|cookie|otp|card|aadhaar|pan/i, jt = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, Nt = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, zt = 8192;
function Q(a) {
  if (a == null)
    return a;
  if (typeof a == "string") {
    let e = a.replace(jt, (t) => {
      const [s, i] = t.split("@");
      return `${s.length > 2 ? `${s[0]}***${s[s.length - 1]}` : `${s[0]}***`}@${i}`;
    });
    return e = e.replace(Nt, (t) => {
      const s = t.replace(/\D/g, "");
      return s.length >= 7 ? `+XX-XXXX-${s.slice(-4)}` : t;
    }), e;
  }
  if (Array.isArray(a))
    return a.map((e) => Q(e));
  if (typeof a == "object") {
    const e = {};
    for (const [t, s] of Object.entries(a))
      Ot.test(t) ? e[t] = "[REDACTED]" : e[t] = Q(s);
    return e;
  }
  return a;
}
function Zt(a) {
  let e = Q(a.responseBody);
  if (e != null)
    try {
      const t = JSON.stringify(e);
      t.length > zt && (e = {
        _truncated: !0,
        sample: typeof e == "object" && e !== null ? Array.isArray(e) ? e.slice(0, 3) : Object.fromEntries(Object.entries(e).slice(0, 5)) : "[Large payload truncated]",
        total_bytes: t.length
      });
    } catch {
    }
  return {
    method: a.method,
    path: a.path,
    query: a.query ? Q(a.query) : void 0,
    requestBody: a.requestBody ? Q(a.requestBody) : void 0,
    status: a.status,
    responseBody: e,
    ts: a.ts || Date.now()
  };
}
function Pt(a) {
  return a.map(Zt);
}
class Lt {
  constructor() {
    w(this, "config", {
      publicKey: "pk_demo_dehix",
      apiUrl: "http://localhost:4000",
      apiPrefix: "/api/"
    });
    w(this, "shadowRoot", null);
    w(this, "isRecording", !1);
    w(this, "recordedEvents", []);
    w(this, "activeTab", "ask");
    w(this, "isOpen", !1);
    w(this, "isListening", !1);
    w(this, "speechRecognition", null);
    w(this, "narrationText", "");
    w(this, "narrationSource", "typed");
    w(this, "recordingTitle", "");
    w(this, "showJudgeBanner", !0);
    // Ask Agent State
    w(this, "chatItems", []);
    w(this, "chatInputText", "");
    w(this, "isAgentBusy", !1);
    w(this, "activePlan", null);
    w(this, "currentRunId", null);
    w(this, "stats", { skillsCount: 6, rulesCount: 3 });
    this.autoInit();
  }
  getNarrationWordCount() {
    const e = this.narrationText.trim();
    return e ? e.split(/\s+/).filter(Boolean).length : 0;
  }
  autoInit() {
    if (typeof window > "u") return;
    const e = () => {
      const t = document.currentScript || document.querySelector('script[src*="sdk.js"]'), s = (t == null ? void 0 : t.getAttribute("data-app")) || window.__SAYDO_APP_KEY__ || "pk_demo_dehix", i = (t == null ? void 0 : t.getAttribute("data-api")) || (t == null ? void 0 : t.getAttribute("data-api-url")) || window.__SAYDO_API_URL__ || "http://localhost:4000";
      this.init({ publicKey: s, apiUrl: i });
    };
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", e) : e();
  }
  init(e) {
    this.config = { ...this.config, ...e }, this.setupInterceptors(), this.initSpeechRecognition(), this.mountWidget(), this.fetchAppStats(), typeof window < "u" && sessionStorage.getItem("saydo_dismiss_judge_banner") === "true" && (this.showJudgeBanner = !1);
    const t = new URLSearchParams(window.location.search);
    t.get("saydo") === "teach" || localStorage.getItem("saydo_mode") === "teach" ? (this.activeTab = "teach", this.isOpen = !0) : (t.get("saydo") === "judge" || t.get("judge") === "true" || t.get("saydo") === "ask" || t.get("demo") === "judge") && (this.activeTab = "ask", this.isOpen = !0, this.showJudgeBanner = !0), this.render(), console.log("[SayDo SDK] Initialized with app:", this.config.publicKey, "API:", this.config.apiUrl);
  }
  async fetchAppStats() {
    try {
      const e = await window.fetch(`${this.config.apiUrl}/v1/stats?publicKey=${this.config.publicKey}`);
      if (e.ok) {
        const t = await e.json();
        this.stats = {
          skillsCount: t.skills_count ?? 6,
          rulesCount: t.policies_count ?? 3
        }, this.render();
      }
    } catch {
    }
  }
  isTeachModeAllowed() {
    return typeof window > "u" ? !1 : new URLSearchParams(window.location.search).get("saydo") === "teach" || localStorage.getItem("saydo_mode") === "teach" || window.saydoTeachMode === !0;
  }
  setupInterceptors() {
    if (typeof window > "u") return;
    const e = this, t = window.fetch;
    window.fetch = async function(...n) {
      var o, u;
      const r = await t.apply(this, n);
      if (e.isRecording)
        try {
          const h = typeof n[0] == "string" ? n[0] : n[0].url, v = new URL(h, window.location.origin);
          if (v.origin === window.location.origin && v.pathname.startsWith(e.config.apiPrefix || "/api/")) {
            const A = r.clone();
            let D = null;
            try {
              D = await A.json();
            } catch {
            }
            const se = (o = n[1]) == null ? void 0 : o.body, ae = e.safeParseBody(se);
            e.addCapturedEvent({
              method: (((u = n[1]) == null ? void 0 : u.method) || "GET").toUpperCase(),
              path: v.pathname,
              query: Object.fromEntries(v.searchParams.entries()),
              requestBody: ae,
              status: r.status,
              responseBody: D,
              ts: Date.now()
            });
          }
        } catch (h) {
          console.warn("[SayDo] Fetch interceptor error:", h);
        }
      return r;
    };
    const s = XMLHttpRequest.prototype.open, i = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(n, r, ...o) {
      return this._saydoMethod = n, this._saydoUrl = r.toString(), s.apply(this, [n, r, ...o]);
    }, XMLHttpRequest.prototype.send = function(n) {
      return e.isRecording && this._saydoUrl && this.addEventListener("load", () => {
        try {
          const r = new URL(this._saydoUrl, window.location.origin);
          if (r.origin === window.location.origin && r.pathname.startsWith(e.config.apiPrefix || "/api/")) {
            let o = null;
            try {
              o = JSON.parse(this.responseText);
            } catch {
            }
            e.addCapturedEvent({
              method: (this._saydoMethod || "GET").toUpperCase(),
              path: r.pathname,
              query: Object.fromEntries(r.searchParams.entries()),
              requestBody: e.safeParseBody(n),
              status: this.status,
              responseBody: o,
              ts: Date.now()
            });
          }
        } catch (r) {
          console.warn("[SayDo] XHR interceptor error:", r);
        }
      }), i.apply(this, [n]);
    };
  }
  addCapturedEvent(e) {
    this.recordedEvents.push(e), this.render();
  }
  safeParseBody(e) {
    if (e) {
      if (typeof e == "string")
        try {
          return JSON.parse(e);
        } catch {
          return e;
        }
      return e;
    }
  }
  initSpeechRecognition() {
    if (typeof window > "u") return;
    const e = window.SpeechRecognition || window.webkitSpeechRecognition;
    e && (this.speechRecognition = new e(), this.speechRecognition.continuous = !0, this.speechRecognition.interimResults = !0, this.speechRecognition.lang = "en-IN", this.speechRecognition.onresult = (t) => {
      let s = "";
      for (let i = t.resultIndex; i < t.results.length; i++)
        s += t.results[i][0].transcript;
      this.activeTab === "teach" ? (this.narrationSource = "voice", this.narrationText = (this.narrationText + " " + s).trim()) : this.chatInputText = (this.chatInputText + " " + s).trim(), this.render();
    }, this.speechRecognition.onerror = () => {
      this.isListening = !1, this.render();
    }, this.speechRecognition.onend = () => {
      this.isListening = !1, this.render();
    });
  }
  toggleSpeech() {
    if (!this.speechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type directly.");
      return;
    }
    if (this.isListening)
      this.speechRecognition.stop(), this.isListening = !1;
    else
      try {
        this.speechRecognition.start(), this.isListening = !0;
      } catch (e) {
        console.warn("Speech start error:", e);
      }
    this.render();
  }
  mountWidget() {
    if (typeof document > "u") return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => this.mountWidget());
      return;
    }
    let e = document.getElementById("saydo-root");
    e || (e = document.createElement("div"), e.id = "saydo-root", document.body.appendChild(e)), this.shadowRoot || (this.shadowRoot = e.attachShadow({ mode: "open" }));
  }
  // Send message to SayDo Agent (/v1/chat)
  async submitUserPrompt(e) {
    if (!e.trim() || this.isAgentBusy) return;
    this.isAgentBusy = !0, this.chatInputText = "";
    const t = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: e
    };
    this.chatItems.push(t), this.render(), await this.callChatApi();
  }
  async callChatApi(e) {
    try {
      const t = this.chatItems.filter((r) => r.text && (r.role === "user" || r.role === "assistant")).map((r) => ({
        role: r.role,
        content: r.text || ""
      })), s = {
        app_key: this.config.publicKey,
        messages: t,
        pending_result: e,
        run_id: this.currentRunId,
        plan: this.activePlan
      }, i = await fetch(`${this.config.apiUrl}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s)
      }), n = await i.json();
      if (!i.ok)
        throw new Error(n.error || "Agent request failed");
      if (n.run_id && (this.currentRunId = n.run_id), n.plan && (this.activePlan = n.plan), n.type === "tool_call") {
        const r = {
          id: n.call_id || `call-${Date.now()}`,
          role: "tool",
          toolCall: {
            call_id: n.call_id,
            skill: n.skill,
            method: n.method,
            path: n.path,
            args: n.args,
            check: n.check,
            blocked: n.blocked,
            needsConfirm: n.needsConfirm,
            message: n.message,
            is_verification: n.is_verification,
            original_write: n.original_write
          },
          status: n.blocked ? "blocked" : "pending",
          verified: n.verified,
          verificationNote: n.verification_note
        };
        this.chatItems.push(r), this.render(), !n.blocked && !n.needsConfirm ? await this.executeToolCall(r) : (this.isAgentBusy = !1, this.render());
      } else n.type === "message" && (this.chatItems.push({
        id: `msg-${Date.now()}`,
        role: "assistant",
        text: n.text,
        sources: n.sources,
        verified: n.verified,
        verificationNote: n.verification_note
      }), this.activePlan && this.activePlan.steps.forEach((r) => r.completed = !0), this.isAgentBusy = !1, this.render());
    } catch (t) {
      this.chatItems.push({
        id: `err-${Date.now()}`,
        role: "assistant",
        text: `Agent Error: ${t.message}`
      }), this.isAgentBusy = !1, this.render();
    }
  }
  // Execute Tool Call in Browser Session with User Credentials
  async executeToolCall(e) {
    if (!e.toolCall) return;
    e.status = "running", this.isAgentBusy = !0, this.render();
    const t = e.toolCall, s = (t.method || "GET").toUpperCase();
    let i = t.path || "/";
    if (s === "GET" && t.args && Object.keys(t.args).length > 0) {
      const n = new URLSearchParams();
      for (const [r, o] of Object.entries(t.args))
        o != null && o !== "" && n.append(r, String(o));
      i = `${i}?${n.toString()}`;
    }
    try {
      const n = await window.fetch(i, {
        method: s,
        headers: {
          "Content-Type": "application/json"
        },
        body: s !== "GET" ? JSON.stringify(t.args) : void 0,
        credentials: "include"
      });
      let r = null;
      try {
        r = await n.json();
      } catch {
        r = { status: n.status };
      }
      if (e.status = "completed", this.activePlan) {
        const o = this.activePlan.steps.find((u) => u.skill_name === t.skill);
        o && (o.completed = !0);
      }
      s !== "GET" && window.dispatchEvent(
        new CustomEvent("saydo:changed", {
          detail: { skill: t.skill, args: t.args, response: r }
        })
      ), await this.callChatApi({
        call_id: t.call_id,
        skill_name: t.skill,
        status: n.status,
        response: r,
        args: t.args,
        is_verification: t.is_verification,
        original_write: t.original_write
      });
    } catch (n) {
      e.status = "cancelled", this.chatItems.push({
        id: `err-${Date.now()}`,
        role: "assistant",
        text: `Execution failed: ${n.message}`
      }), this.isAgentBusy = !1, this.render();
    }
  }
  cancelToolCall(e) {
    e.status = "cancelled", this.isAgentBusy = !1, this.render();
  }
  render() {
    if (!this.shadowRoot) return;
    const e = this.isTeachModeAllowed();
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          line-height: 1.4;
          color: #e2e8f0;
          box-sizing: border-box;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }

        /* Launcher */
        .saydo-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #ffffff;
          border-radius: 9999px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.12);
          z-index: 2147483647;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
        }
        .saydo-launcher:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px -5px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.5);
        }
        .saydo-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${this.isRecording ? "#ef4444" : this.isAgentBusy ? "#f59e0b" : "#10b981"};
          box-shadow: 0 0 8px ${this.isRecording ? "#ef4444" : this.isAgentBusy ? "#f59e0b" : "#10b981"};
          animation: ${this.isRecording || this.isAgentBusy ? "pulse 1s infinite" : "none"};
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        /* Panel */
        .saydo-panel {
          position: fixed;
          bottom: 76px;
          right: 24px;
          width: 420px;
          max-height: calc(100vh - 100px);
          height: 580px;
          background: #0b0f19;
          border: 1px solid #1e293b;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
          z-index: 2147483647;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: bottom right;
          opacity: ${this.isOpen ? "1" : "0"};
          transform: ${this.isOpen ? "translateY(0) scale(1)" : "translateY(16px) scale(0.95)"};
          pointer-events: ${this.isOpen ? "auto" : "none"};
        }

        /* Accessible Focus States */
        button:focus-visible, input:focus-visible, textarea:focus-visible {
          outline: 2px solid #10b981 !important;
          outline-offset: 2px !important;
        }

        /* Mobile Layout */
        @media (max-width: 640px) {
          .saydo-panel {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 88vh !important;
            max-height: 88vh !important;
            border-radius: 20px 20px 0 0 !important;
          }
          .saydo-launcher {
            bottom: 16px !important;
            right: 16px !important;
          }
        }

        /* Header */
        .saydo-header {
          padding: 14px 18px;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .saydo-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          color: #ffffff;
          font-size: 14px;
        }
        .saydo-badge {
          font-size: 10px;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 2px 6px;
          border-radius: 9999px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .saydo-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          padding: 4px;
        }
        .saydo-close:hover { color: #ffffff; }

        /* Tabs */
        .saydo-tabs {
          display: flex;
          background: #090d16;
          border-bottom: 1px solid #1e293b;
          padding: 4px;
          gap: 4px;
        }
        .saydo-tab-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #94a3b8;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .saydo-tab-btn.active {
          background: #1e293b;
          color: #ffffff;
        }

        /* Body */
        .saydo-body {
          flex: 1;
          padding: 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Ask Agent Styles */
        .saydo-plan-box {
          background: #0d1527;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 12px;
        }
        .saydo-plan-title {
          font-weight: 700;
          color: #60a5fa;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .saydo-step-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 3px 0;
          color: #cbd5e1;
        }
        .saydo-step-done {
          color: #10b981;
          font-weight: 600;
        }

        .saydo-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 4px;
        }
        .saydo-chip {
          background: #1e293b;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 5px 10px;
          border-radius: 9999px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .saydo-chip:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #3b82f6;
        }

        /* Messages */
        .saydo-msg-user {
          align-self: flex-end;
          background: #1e3a8a;
          color: #eff6ff;
          padding: 8px 12px;
          border-radius: 14px 14px 2px 14px;
          max-width: 85%;
          font-size: 12px;
        }
        .saydo-msg-assistant {
          align-self: flex-start;
          background: #131b2e;
          border: 1px solid #1e293b;
          color: #e2e8f0;
          padding: 10px 14px;
          border-radius: 14px 14px 14px 2px;
          max-width: 90%;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* Typing Indicator */
        .saydo-typing-indicator {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #131b2e;
          border: 1px solid #1e293b;
          border-radius: 12px;
          width: fit-content;
        }
        .saydo-typing-dot {
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
          animation: saydo-bounce 1.4s infinite ease-in-out both;
        }
        .saydo-typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        .saydo-typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes saydo-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .saydo-typing-text {
          font-size: 11px;
          color: #94a3b8;
          margin-left: 6px;
        }

        /* Tool Cards */
        .saydo-card-confirm {
          border-radius: 12px;
          border: 1px solid #3b82f6;
          background: #0f172a;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }
        .saydo-card-blocked {
          border-radius: 12px;
          border: 1px solid #ef4444;
          background: #450a0a;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
        .saydo-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          font-size: 12px;
        }
        .saydo-args-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          overflow: hidden;
        }
        .saydo-args-table td {
          padding: 4px 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .saydo-card-btns {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .saydo-btn-confirm {
          flex: 1;
          background: #2563eb;
          color: #ffffff;
          padding: 8px;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .saydo-btn-confirm:hover { background: #1d4ed8; }
        .saydo-btn-cancel {
          background: #334155;
          color: #cbd5e1;
          padding: 8px 12px;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-btn-cancel:hover { background: #475569; }

        .saydo-badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        /* Footer Input */
        .saydo-footer {
          padding: 10px 14px;
          background: #0f172a;
          border-top: 1px solid #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .saydo-chat-input {
          flex: 1;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 8px 12px;
          color: #f8fafc;
          font-size: 12px;
          outline: none;
        }
        .saydo-chat-input:focus {
          border-color: #3b82f6;
        }
        .saydo-icon-btn {
          background: #1e293b;
          border: 1px solid #334155;
          color: #cbd5e1;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
        }
        .saydo-icon-btn.active {
          background: #ef4444;
          color: #ffffff;
        }
        .saydo-send-btn {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Teach View Elements */
        .saydo-rec-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 12px;
          background: #131b2e;
          border: 1px solid #1e293b;
        }
        .saydo-rec-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 12px;
        }
        .saydo-rec-btn {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        .saydo-rec-btn.start { background: #ef4444; color: #ffffff; }
        .saydo-rec-btn.stop { background: #334155; color: #f1f5f9; }
        .saydo-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        .saydo-input, .saydo-textarea {
          width: 100%;
          background: #070a12;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 10px 12px;
          color: #f8fafc;
          font-size: 12px;
          outline: none;
          font-family: inherit;
        }
        .saydo-events-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .saydo-event-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          border-radius: 8px;
          background: #090e1a;
          border: 1px solid #1e293b;
          font-size: 11px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }
        .saydo-method { font-weight: bold; color: #60a5fa; }
        .saydo-path { color: #cbd5e1; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
        .saydo-save-btn {
          padding: 10px;
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .saydo-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      </style>

      <!-- Launcher Button -->
      <button class="saydo-launcher" id="saydo-launcher">
        <span class="saydo-indicator"></span>
        <span>${this.isRecording ? "Recording (SayDo)" : this.isAgentBusy ? "SayDo Working..." : "SayDo Agent"}</span>
      </button>

      <!-- Panel -->
      <div class="saydo-panel" id="saydo-panel">
        <div class="saydo-header">
          <div class="saydo-brand">
            <span>⚡ SayDo</span>
            <span class="saydo-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">
              Agent-ready: ${this.stats.skillsCount} skills · ${this.stats.rulesCount} rules
            </span>
          </div>
          <button class="saydo-close" id="saydo-close" aria-label="Close SayDo panel">&times;</button>
        </div>

        ${e ? `
          <div class="saydo-tabs">
            <button class="saydo-tab-btn ${this.activeTab === "ask" ? "active" : ""}" id="tab-ask">
              Ask Agent
            </button>
            <button class="saydo-tab-btn ${this.activeTab === "teach" ? "active" : ""}" id="tab-teach">
              Teach by Doing
            </button>
          </div>
        ` : ""}

        <div class="saydo-body" id="saydo-body">
          ${this.activeTab === "teach" && e ? `
            <!-- Teach View -->
            <div class="saydo-rec-bar">
              <div class="saydo-rec-status">
                <span class="saydo-indicator"></span>
                <span>${this.isRecording ? "Capturing App API Calls..." : "Recorder Ready"}</span>
              </div>
              <button class="saydo-rec-btn ${this.isRecording ? "stop" : "start"}" id="btn-toggle-rec">
                ${this.isRecording ? "Stop Recording" : "● Record Task"}
              </button>
            </div>

            <div>
              <div class="saydo-label">Task Title</div>
              <input 
                type="text" 
                class="saydo-input" 
                id="input-title" 
                placeholder="e.g. Create Website Revamp Project" 
                value="${this.recordingTitle}"
              />
            </div>

            <div>
              <div class="saydo-label" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 600; color: #f1f5f9;">Spoken Task Narration</span>
                <span class="saydo-badge" style="background: rgba(168, 85, 247, 0.15); color: #c084fc; border-color: rgba(168, 85, 247, 0.35); font-size: 9px; font-weight: 600;">
                  🎙️ Works with Wispr Flow
                </span>
              </div>

              <!-- Wispr Flow Hint Chip & Fallback -->
              <div style="font-size: 11px; color: #c084fc; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; background: rgba(168, 85, 247, 0.1); padding: 6px 10px; border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span>✨</span>
                  <span style="font-weight: 500;">Hold your Wispr hotkey and talk</span>
                </div>
                <button id="btn-mic-teach" style="background: ${this.isListening ? "#ef4444" : "rgba(255, 255, 255, 0.08)"}; border: 1px solid ${this.isListening ? "#f87171" : "rgba(255, 255, 255, 0.15)"}; color: ${this.isListening ? "#fff" : "#cbd5e1"}; padding: 2px 7px; border-radius: 6px; font-size: 10px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease;" title="Browser Web Speech fallback">
                  <span>${this.isListening ? "🛑 Stop" : "🎙️ Mic fallback"}</span>
                </button>
              </div>

              <div style="position: relative;">
                <textarea 
                  class="saydo-textarea" 
                  id="textarea-narration" 
                  rows="4" 
                  style="min-height: 85px; font-size: 12px; line-height: 1.5; resize: vertical;"
                  placeholder="Hold your Wispr key and explain this task like you'd explain it to a new teammate…"
                >${this.narrationText}</textarea>
              </div>

              <div id="narration-word-count" style="font-size: 10px; color: #94a3b8; margin-top: 5px; display: flex; align-items: center; justify-content: space-between; padding: 0 2px;">
                <span>${this.getNarrationWordCount()} words</span>
                <span style="color: ${this.narrationSource === "voice" ? "#c084fc" : "#64748b"}; font-weight: 500;">
                  ${this.narrationSource === "voice" ? "🎙️ likely dictated" : "⌨️ typed"}
                </span>
              </div>
              ${this.isListening ? '<div style="font-size: 10px; color: #c084fc; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;"><span class="saydo-indicator" style="background: #c084fc; box-shadow: 0 0 8px #c084fc;"></span> Web Speech API active (en-IN)... Speak clearly.</div>' : ""}
            </div>

            <div>
              <div class="saydo-label">Captured Network Calls (${this.recordedEvents.length})</div>
              <div class="saydo-events-box">
                ${this.recordedEvents.length === 0 ? `<div style="font-size: 11px; color: #64748b; font-style: italic; padding: 4px;">Click 'Record Task' and interact with DEHIX-lite. API calls appear here live.</div>` : this.recordedEvents.map(
      (t) => `
                        <div class="saydo-event-item">
                          <div>
                            <span class="saydo-method">${t.method}</span>
                            <span class="saydo-path" title="${t.path}">${t.path}</span>
                          </div>
                          <span style="color: #10b981; font-size: 10px;">${t.status}</span>
                        </div>
                      `
    ).join("")}
              </div>
            </div>

            <button class="saydo-save-btn" id="btn-save-recording" ${this.recordedEvents.length === 0 ? "disabled" : ""}>
              Stop & Save to SayDo
            </button>
          ` : `
            <!-- Ask Agent View -->
            ${this.showJudgeBanner ? `
              <div class="saydo-judge-banner" style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(59, 130, 246, 0.15)); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; font-size: 11px; color: #f1f5f9; display: flex; flex-direction: column; gap: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                  <div style="font-weight: 700; color: #c084fc; display: flex; align-items: center; gap: 6px;">
                    <span>⚖️</span>
                    <span>Judge Quickstart Guide</span>
                  </div>
                  <button id="btn-dismiss-judge-banner" style="background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Dismiss">&times;</button>
                </div>
                <div style="font-size: 11px; line-height: 1.45; color: #cbd5e1;">
                  <strong>Step 1:</strong> Click a prompt chip below or hold your Wispr key and speak.<br/>
                  <strong>Step 2:</strong> Watch the deterministic policy check execute in real-time.<br/>
                  <strong>Step 3:</strong> Confirm write actions with human-in-the-loop safety.
                </div>
              </div>
            ` : ""}

            ${this.activePlan ? `
              <div class="saydo-plan-box">
                <div class="saydo-plan-title">
                  <span>📋 Execution Plan</span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${this.activePlan.summary}</div>
                ${this.activePlan.steps.map(
      (t) => `
                  <div class="saydo-step-row ${t.completed ? "saydo-step-done" : ""}">
                    <span>${t.completed ? "✓" : "○"}</span>
                    <span><strong>Step ${t.idx}:</strong> ${t.description || t.skill_name}</span>
                  </div>
                `
    ).join("")}
              </div>
            ` : `
              <div style="font-size: 11px; color: #94a3b8; font-weight: 600; display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span>SUGGESTED PROMPTS FOR JUDGES</span>
                <span style="font-size: 10px; color: #c084fc; font-weight: 500;">Click to run</span>
              </div>
              <div class="saydo-chips">
                <button class="saydo-chip" data-prompt="List all active projects and budgets">
                  📋 List all active projects and budgets
                </button>
                <button class="saydo-chip" data-prompt="Create Website Revamp for 2 lakh">
                  ⚡ Create Website Revamp for 2 lakh
                </button>
                <button class="saydo-chip" data-prompt="Invite mentor@dehix.xyz as editor">
                  👥 Invite mentor@dehix.xyz as editor
                </button>
                <button class="saydo-chip" data-prompt="Try to create a project with 15 lakh budget">
                  🛑 Try to create a project with 15 lakh budget <span style="color: #f87171; font-size: 9px; margin-left: 2px;">(test policy block!)</span>
                </button>
              </div>
            `}

            <!-- Messages Stream -->
            ${this.chatItems.map((t) => {
      if (t.role === "user")
        return `<div class="saydo-msg-user">${t.text}</div>`;
      if (t.toolCall) {
        const s = t.toolCall;
        if (s.blocked)
          return `
                      <div class="saydo-card-blocked">
                        <div class="saydo-card-header" style="color: #f87171;">
                          <span>🛑 Action Blocked by Platform Policy</span>
                          <span>${s.skill}</span>
                        </div>
                        <div style="font-size: 11px; color: #fca5a5;">${s.message || "Blocked by security policy."}</div>
                        <table class="saydo-args-table">
                          ${Object.entries(s.args || {}).map(([i, n]) => `<tr><td style="color:#94a3b8;">${i}</td><td>${n}</td></tr>`).join("")}
                        </table>
                      </div>
                    `;
        if (t.status === "pending")
          return `
                      <div class="saydo-card-confirm" data-call-id="${s.call_id}">
                        <div class="saydo-card-header" style="color: #60a5fa;">
                          <span>⚠️ Confirmation Required</span>
                          <span style="font-size: 10px; background: rgba(59, 130, 246, 0.2); padding: 2px 6px; border-radius: 4px;">WRITE</span>
                        </div>
                        <div style="font-size: 12px; font-weight: 600; color: #f8fafc;">Action: ${s.skill}</div>
                        <table class="saydo-args-table">
                          ${Object.entries(s.args || {}).map(
            ([i, n]) => `
                            <tr>
                              <td style="color: #94a3b8; width: 35%;">${i}</td>
                              <td style="color: #f8fafc; font-weight: 500;">
                                ${i === "budget" ? "₹" + Number(n).toLocaleString("en-IN") : n}
                              </td>
                            </tr>
                          `
          ).join("")}
                        </table>
                        <div style="font-size: 10px; color: #94a3b8;">
                          🔒 Policy notice: Writes execute using your browser session.
                        </div>
                        <div class="saydo-card-btns">
                          <button class="saydo-btn-confirm" data-action="confirm" data-id="${t.id}">
                            ✓ Confirm & Execute
                          </button>
                          <button class="saydo-btn-cancel" data-action="cancel" data-id="${t.id}">
                            Cancel
                          </button>
                        </div>
                      </div>
                    `;
        if (t.status === "running")
          return `
                      <div class="saydo-msg-assistant" style="opacity: 0.8;">
                        <div>⏳ Executing <strong>${s.skill}</strong> in your browser...</div>
                      </div>
                    `;
        if (t.status === "completed")
          return `
                      <div class="saydo-msg-assistant">
                        <div style="color: #94a3b8; font-size: 11px;">✓ Executed ${s.skill}</div>
                        ${t.verified ? `<div class="saydo-badge-verified">✓ ${t.verificationNote || "Verified in system"}</div>` : ""}
                      </div>
                    `;
      }
      return `
                  <div class="saydo-msg-assistant">
                    <div>${t.text}</div>
                    ${t.sources && t.sources.length > 0 ? `
                      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #334155;">
                        <div style="font-size: 10px; color: #94a3b8; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
                          <span>🔍 Tavily Grounded Sources:</span>
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                          ${t.sources.map(
        (s) => `
                            <a href="${s.url}" target="_blank" style="font-size: 10px; color: #60a5fa; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); padding: 2px 6px; border-radius: 4px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;" title="${s.content || ""}">
                              <span>📄</span>
                              <span>${s.title || "Documentation"}</span>
                            </a>
                          `
      ).join("")}
                        </div>
                      </div>
                    ` : ""}
                    ${t.verified ? `<div class="saydo-badge-verified">✓ ${t.verificationNote || "Verified in system"}</div>` : ""}
                  </div>
                `;
    }).join("")}

            ${this.isAgentBusy ? `
              <div class="saydo-typing-indicator">
                <span class="saydo-typing-dot"></span>
                <span class="saydo-typing-dot"></span>
                <span class="saydo-typing-dot"></span>
                <span class="saydo-typing-text">SayDo is reasoning...</span>
              </div>
            ` : ""}
          `}
        </div>

        ${this.activeTab === "ask" ? `
          <!-- Footer Chat Input -->
          <div class="saydo-footer">
            <input 
              type="text" 
              class="saydo-chat-input" 
              id="input-chat" 
              placeholder="Ask by voice or text... e.g. 'Create project with 2 lakh budget'" 
              value="${this.chatInputText}"
            />
            <button class="saydo-icon-btn ${this.isListening ? "active" : ""}" id="btn-mic-ask" title="Dictate voice (Web Speech API / Wispr)">
              ${this.isListening ? "🛑" : "🎙️"}
            </button>
            <button class="saydo-send-btn" id="btn-send-chat" ${this.isAgentBusy ? "disabled" : ""}>
              Send
            </button>
          </div>
        ` : ""}
      </div>
    `, this.attachEventListeners();
  }
  attachEventListeners() {
    var i, n, r, o, u, h, v, A, D, se, ae;
    if (!this.shadowRoot) return;
    (i = this.shadowRoot.getElementById("saydo-launcher")) == null || i.addEventListener("click", () => {
      this.isOpen = !this.isOpen, this.render();
    }), (n = this.shadowRoot.getElementById("saydo-close")) == null || n.addEventListener("click", () => {
      this.isOpen = !1, this.render();
    }), (r = this.shadowRoot.getElementById("tab-ask")) == null || r.addEventListener("click", () => {
      this.activeTab = "ask", this.render();
    }), (o = this.shadowRoot.getElementById("tab-teach")) == null || o.addEventListener("click", () => {
      this.activeTab = "teach", this.render();
    }), (u = this.shadowRoot.getElementById("btn-toggle-rec")) == null || u.addEventListener("click", () => {
      this.isRecording ? (this.isRecording = !1, this.render()) : (this.isRecording = !0, this.recordedEvents = [], this.render(), setTimeout(() => {
        var E;
        const _ = (E = this.shadowRoot) == null ? void 0 : E.getElementById("textarea-narration");
        _ == null || _.focus();
      }, 50));
    }), (h = this.shadowRoot.getElementById("btn-mic-teach")) == null || h.addEventListener("click", () => {
      this.narrationSource = "voice", this.toggleSpeech();
    }), (v = this.shadowRoot.getElementById("btn-mic-ask")) == null || v.addEventListener("click", () => this.toggleSpeech()), (A = this.shadowRoot.getElementById("input-title")) == null || A.addEventListener("input", (_) => {
      this.recordingTitle = _.target.value;
    });
    const e = this.shadowRoot.getElementById("textarea-narration");
    e == null || e.addEventListener("input", (_) => {
      var ke;
      const E = this.narrationText.length, Z = _.target.value, K = Z.length - E, qe = _;
      (K > 15 || qe.inputType === "insertFromPaste") && (this.narrationSource = "voice"), this.narrationText = Z;
      const _e = (ke = this.shadowRoot) == null ? void 0 : ke.getElementById("narration-word-count");
      if (_e) {
        const Fe = this.getNarrationWordCount(), Xe = this.narrationSource === "voice" ? "🎙️ likely dictated" : "⌨️ typed", He = this.narrationSource === "voice" ? "#c084fc" : "#64748b";
        _e.innerHTML = `<span>${Fe} words</span><span style="color: ${He}; font-weight: 500;">${Xe}</span>`;
      }
    }), (D = this.shadowRoot.getElementById("btn-dismiss-judge-banner")) == null || D.addEventListener("click", () => {
      this.showJudgeBanner = !1, typeof window < "u" && sessionStorage.setItem("saydo_dismiss_judge_banner", "true"), this.render();
    }), (se = this.shadowRoot.getElementById("btn-save-recording")) == null || se.addEventListener("click", () => this.saveRecording());
    const t = this.shadowRoot.getElementById("input-chat");
    t == null || t.addEventListener("input", (_) => {
      this.chatInputText = _.target.value;
    }), t == null || t.addEventListener("keydown", (_) => {
      _.key === "Enter" && this.submitUserPrompt(this.chatInputText);
    }), (ae = this.shadowRoot.getElementById("btn-send-chat")) == null || ae.addEventListener("click", () => {
      this.submitUserPrompt(this.chatInputText);
    }), this.shadowRoot.querySelectorAll(".saydo-chip").forEach((_) => {
      _.addEventListener("click", () => {
        const E = _.getAttribute("data-prompt");
        E && this.submitUserPrompt(E);
      });
    }), this.shadowRoot.querySelectorAll('[data-action="confirm"]').forEach((_) => {
      _.addEventListener("click", () => {
        const E = _.getAttribute("data-id"), Z = this.chatItems.find((K) => K.id === E);
        Z && this.executeToolCall(Z);
      });
    }), this.shadowRoot.querySelectorAll('[data-action="cancel"]').forEach((_) => {
      _.addEventListener("click", () => {
        const E = _.getAttribute("data-id"), Z = this.chatItems.find((K) => K.id === E);
        Z && this.cancelToolCall(Z);
      });
    });
    const s = this.shadowRoot.getElementById("saydo-body");
    s && (s.scrollTop = s.scrollHeight);
  }
  async saveRecording() {
    if (this.recordedEvents.length === 0) return;
    const e = this.recordingTitle.trim() || `Recording ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`, t = this.narrationText.trim(), s = Pt(this.recordedEvents), i = t ? t.split(/\s+/).filter(Boolean).length : 0, n = {
      publicKey: this.config.publicKey,
      title: e,
      events: s,
      narration: t,
      narration_metadata: {
        source: this.narrationSource,
        words: i,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    try {
      const r = await fetch(`${this.config.apiUrl}/v1/recordings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SayDo-Public-Key": this.config.publicKey
        },
        body: JSON.stringify(n)
      }), o = await r.json();
      if (!r.ok) throw new Error(o.error || "Failed to save recording");
      alert(`✅ Recording "${e}" successfully stored in SayDo! (${o.event_count} sanitized events)`), this.recordedEvents = [], this.recordingTitle = "", this.narrationText = "", this.narrationSource = "typed", this.render();
    } catch (r) {
      alert(`❌ Failed to save recording: ${r.message}`);
    }
  }
}
const Bt = new Lt();
typeof window < "u" && (window.SayDo = Bt);
export {
  Bt as default
};

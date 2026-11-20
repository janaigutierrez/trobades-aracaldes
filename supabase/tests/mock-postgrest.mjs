// Simulador mínim de l'API REST de Supabase (PostgREST) NOMÉS per provar la part pública en local.
import http from "node:http";
const now = Date.now(), day = 86400000;
const iso = (ms) => new Date(ms).toISOString();
const base = { descripcio: "", ponent: null, coorganitzador: null, barri: null, fi: null, adreca: null, imatge_url: null, aforament: null,
  inscripcions_obertes: false, aportacions_obertes: false, emissio_url: null, emissio_alt_url: null, resum: null, conclusions: null,
  enllac_web: null, assistents_presencials: null, assistents_virtuals: null, publicar_assistents: false, created_at: iso(now), updated_at: iso(now) };
const trobades = [
  { ...base, id: "11111111-1111-4111-8111-111111111111", slug: "trobada-barris-can-valls", tipus: "barris", estat: "propera",
    titol: "Trobada de barris: Can Valls", barri: "Can Valls", inici: iso(now + 21 * day), fi: iso(now + 21 * day + 5400000),
    lloc: "Local social de Can Valls", adreca: "Adreça de demostració", aforament: 60, inscripcions_obertes: true, aportacions_obertes: true,
    descripcio: "Volem escoltar els veïns i veïnes de Can Valls: mobilitat, serveis, manteniment i el futur de la urbanització.",
    emissio_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", emissio_alt_url: "https://www.youtube.com/" },
  { ...base, id: "22222222-2222-4222-8222-222222222222", slug: "xerrada-finances-municipals", tipus: "xerrada", estat: "propera",
    titol: "Xerrada: Les finances municipals, explicades", inici: iso(now + 45 * day), lloc: "Cases dels Mestres", aforament: 80,
    ponent: "Ponent de demostració", coorganitzador: "Entitat coorganitzadora (demo)", inscripcions_obertes: true, aportacions_obertes: false,
    descripcio: "D'on surten els diners de l'Ajuntament i com es decideix en què es gasten?" },
  { ...base, id: "33333333-3333-4333-8333-333333333333", slug: "trobada-barris-demo-passada", tipus: "barris", estat: "celebrada",
    titol: "Trobada de barris: exemple de trobada celebrada", inici: iso(now - 30 * day), lloc: "Espai de demostració",
    resum: "Els veïns van posar sobre la taula la mobilitat i la neteja.", conclusions: "1. Aparcament dissuasori.\n2. Calendari públic de manteniment.",
    assistents_presencials: 34, assistents_virtuals: 12, publicar_assistents: true },
  { ...base, id: "44444444-4444-4444-8444-444444444444", slug: "esborrany-secret", tipus: "xerrada", estat: "esborrany", titol: "Esborrany", inici: iso(now), lloc: "X" },
];
const inserts = [];
http.createServer((req, res) => {
  const u = new URL(req.url, "http://x");
  let body = ""; req.on("data", (c) => (body += c));
  req.on("end", () => {
    const send = (code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
    if (u.pathname === "/rest/v1/rpc/places_disponibles") return send(200, 58);
    if (req.method === "POST" && /\/rest\/v1\/(inscripcions|aportacions)/.test(u.pathname)) {
      inserts.push({ taula: u.pathname, ...JSON.parse(body) });
      console.log("INSERT", u.pathname, body, "auth:", (req.headers.authorization || "").slice(0, 30));
      return send(201, []);
    }
    if (u.pathname === "/rest/v1/trobades") {
      let rows = trobades.filter((t) => t.estat !== "esborrany"); // RLS anon
      for (const [k, v] of u.searchParams) if (v.startsWith("eq.")) rows = rows.filter((r) => String(r[k]) === v.slice(3));
      const ord = u.searchParams.get("order");
      if (ord) { const [c, dir] = ord.split("."); rows.sort((a, b) => (a[c] < b[c] ? -1 : 1) * (dir === "desc" ? -1 : 1)); }
      if ((req.headers.accept || "").includes("vnd.pgrst.object")) {
        return rows.length === 1 ? send(200, rows[0]) : send(406, { code: "PGRST116", message: "0 rows" });
      }
      return send(200, rows);
    }
    send(404, { message: "not mocked " + u.pathname });
  });
}).listen(54321, () => console.log("mock on 54321"));

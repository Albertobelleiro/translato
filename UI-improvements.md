Necesito mejorar algunas cosas de la UI, primero de todo, necesito que mejore la interfaz de usuario. Utiliza la imagen de referencia para mejorarlo, tambien necesito que mejores el UX de forma completa, que hagas un analisis para ver que partes de la UI son menos intuitivas y como mejorarlas. Además, necesito que mejore la velocidad de carga de la página y que optimice la compatibilidad con diferentes dispositivos y navegadores. Tambien necesito que hagas una pagina para el historial y que asi no se vea todo el rato ahi abajo, asi esta todo mas limpio, otra cosa que estaria bien cambiar es el scroll bar de todo, necesito que sea mas amigable y mas incusivo con el sitio, ahora mismo toda la app esta en oscuro y con una tonalidad exacta, menos la scroll bar, despues añade un favicon. Tambien quiero que identifiques algunas secciones que podrian tener alguana animacion y que añadas animaciones de forma perfecta con la libreria anime js. Quiero que añadas algunos shortcuts correctos y exactos, como por ejemplo cmd + c se copia directamente la traduccion sin tener que seleccionarla haciendo que tambien salga la animacion de copiado abajo en el icono del portapapeles, mas cosas asi, quiero que lo analizes todo para poder dejarlo todo mas bonito. Tambien quiero que añadas estos avatares automaticos, en vez de los de clerk: bun add facehash
de forma exacta mejora las siguientes cosas:
- Mejorar la interfaz de usuario utilizando la imagen de referencia.
- Mejorar el UX de forma completa, haciendo un análisis para identificar partes menos intuitivas y mejorarlas.
- Mejorar la velocidad de carga de la página y optimizar la compatibilidad con diferentes dispositivos y navegadores.
- Crear una página para el historial para evitar que se vea todo el tiempo abajo, dejando el sitio más limpio.
- Cambiar el scroll bar para que sea más amigable y accesible.
- Añadir un favicon.
- Identificar secciones que podrían tener alguna animación y añadir animaciones perfectas utilizando la librería anime.js.
- Añadir shortcuts correctos y exactos, como por ejemplo cmd + c para copiar directamente la traducción sin tener que seleccionarla haciendo que también salga la animación de copiado abajo en el icono del portapapeles.
- Añadir un light mode (aunque la imagen adjuntada sea en lightmode necesito que mantengas el modo oscuro)


Necesito que actues como un desarrollador profesional y que encuentres la manera mas limpia de resolver estos errores y que no vuelvan a suceder ni a aparecer de nuevo:
P1: Enforce authentication before issuing DeepL requests

The translate action performs the outbound DeepL call and parses the response before requireUser(ctx) runs, so unauthenticated or non-allowlisted callers can still trigger paid upstream translations and consume quota even though the action ultimately throws Not authenticated. This makes the endpoint abusable for resource exhaustion; the auth guard should run before any external request.

P2: Badge Stop returning internal allowlists from /api/config

handleConfig includes internalAllowedEmails and internalAllowedDomains in its JSON response, and this endpoint is exposed as a public GET route, so any unauthenticated client can enumerate internal accounts/domains. This leaks sensitive organization metadata and should be avoided by keeping allowlist checks server-side or returning only non-sensitive config.

P2: Badge Do not rely on AbortController with Convex action calls

The hook still creates and aborts an AbortController, but translateAction(...) does not receive a signal, so in-flight requests are not actually canceled. Rapid input changes can launch overlapping Convex actions that still execute DeepL calls (and side effects) even when their results are discarded locally, causing avoidable quota and write amplification.
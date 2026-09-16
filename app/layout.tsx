import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FSM Company — Sistema Operacional',
  description: 'Sistema operacional interno da FSM Company para gestão comercial, prospecção de leads, clientes, projetos, finanças multimoeda (BRL/USD) e catálogo de soluções.',
  openGraph: {
    title: 'FSM Company — Sistema Operacional',
    description: 'Sistema operacional interno da FSM Company para gestão comercial, prospecção de leads, clientes, projetos, finanças multimoeda (BRL/USD) e catálogo de soluções.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FSM Company — Sistema Operacional',
    description: 'Sistema operacional interno da FSM Company para gestão comercial, prospecção de leads, clientes, projetos, finanças multimoeda (BRL/USD) e catálogo de soluções.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined') {
                    window.addEventListener('error', function(event) {
                      if (event && event.message && event.message.indexOf('fetch') !== -1 && event.message.indexOf('getter') !== -1) {
                        event.preventDefault();
                        return true;
                      }
                    }, true);

                    var targets = [window];
                    if (typeof Window !== 'undefined' && Window.prototype) {
                      targets.push(Window.prototype);
                    }
                    if (typeof globalThis !== 'undefined' && globalThis !== window) {
                      targets.push(globalThis);
                    }

                    for (var i = 0; i < targets.length; i++) {
                      var target = targets[i];
                      try {
                        var desc = Object.getOwnPropertyDescriptor(target, 'fetch');
                        if (desc && !desc.set && (desc.configurable || desc.writable === undefined)) {
                          var originalFetch = target.fetch;
                          Object.defineProperty(target, 'fetch', {
                            get: function() { return originalFetch; },
                            set: function(val) { originalFetch = val; },
                            configurable: true,
                            enumerable: true
                          });
                        }
                      } catch (e) {}
                    }

                    var winDesc = Object.getOwnPropertyDescriptor(window, 'fetch');
                    if (!winDesc || !winDesc.set) {
                      var curFetch = window.fetch;
                      try {
                        Object.defineProperty(window, 'fetch', {
                          get: function() { return curFetch; },
                          set: function(val) { curFetch = val; },
                          configurable: true,
                          enumerable: true
                        });
                      } catch (e) {
                        try {
                          Object.defineProperty(window, 'fetch', {
                            value: curFetch,
                            writable: true,
                            configurable: true,
                            enumerable: true
                          });
                        } catch (e2) {}
                      }
                    }
                  }
                } catch (err) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-neutral-50 text-neutral-900 antialiased font-sans selection:bg-blue-100 selection:text-blue-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}

import React from 'react';

const LAST_UPDATED = '12 de marzo de 2026';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Política de Privacidad
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Última actualización: {LAST_UPDATED}
      </p>

      <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            1. Información que recopilamos
          </h2>
          <p>
            Recopilamos los datos que proporcionas al registrarte o usar la plataforma, como nombre de usuario,
            correo electrónico, avatar, historial de partidas y datos técnicos básicos necesarios para la seguridad
            y funcionamiento del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            2. Cómo usamos la información
          </h2>
          <p>
            Utilizamos esta información para autenticar tu cuenta, mostrar tu perfil, permitir partidas online,
            calcular ranking ELO, prevenir abuso y mejorar la experiencia general del usuario.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            3. Base legal y consentimiento
          </h2>
          <p>
            Tratamos tus datos para prestar el servicio solicitado y, cuando corresponda, con base en tu
            consentimiento. Puedes solicitar la revisión o eliminación de tus datos según la normativa aplicable.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            4. Conservación de datos
          </h2>
          <p>
            Conservamos la información durante el tiempo necesario para operar la plataforma, cumplir obligaciones
            legales y mantener integridad de estadísticas e historial de partidas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            5. Compartición de datos
          </h2>
          <p>
            No vendemos tus datos personales. Solo compartimos información cuando sea necesario para operar la
            plataforma, cumplir requerimientos legales o proteger la seguridad del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            6. Seguridad
          </h2>
          <p>
            Aplicamos medidas razonables de seguridad técnica y organizativa para proteger la información contra
            accesos no autorizados, alteración, pérdida o divulgación.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            7. Tus derechos
          </h2>
          <p>
            Puedes solicitar acceso, rectificación, eliminación u oposición al tratamiento de tus datos, dentro de
            los límites previstos por la ley.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            8. Cambios en esta política
          </h2>
          <p>
            Podemos actualizar esta política para reflejar cambios legales o funcionales. Publicaremos la versión
            vigente en esta misma página.
          </p>
        </section>
      </div>
    </div>
  );
};

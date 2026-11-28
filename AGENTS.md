# Instrucciones de agentes

## Criterios jurídico-tecnológicos transversales
Al diseñar, corregir, auditar o publicar, leer `docs/ASESOR_LEGAL_TECNOLOGICO.md`. Aplicar sus siete capas cuando sean relevantes (legal, técnica, seguridad, datos, evidencia, responsabilidad y negocio), documentar jurisdicción, licencias y datos, y separar hechos de hipótesis. No afirmar cumplimiento legal ni autorizaciones sin evidencia. Estas pautas complementan, sin sustituir, las pruebas técnicas y el criterio profesional habilitado.

## Colaboración Claude + ChatGPT/Codex mediante GitHub
Para cambios, auditorías, Pull Requests y transferencias entre agentes, aplicar `docs/agent-workflow.md`. Recuperar el Issue, diff, SHA y resultados de pruebas antes de pedir contexto adicional. No asumir que la rama predeterminada se llama `main`. Mantener estas reglas específicas del proyecto y las exigencias jurídico-tecnológicas aplicables; el protocolo compartido no las reemplaza.

## Memoria y continuidad obligatorias
Este repositorio es la **fuente oficial de continuidad**: ninguna tarea depende de un chat, de la memoria de un agente ni de repositorios externos. Obligaciones permanentes para todo agente (Claude, ChatGPT/Codex u otro):

1. **Recuperar el contexto antes de empezar:** leer [`docs/MEMORIA_OPERATIVA.md`](docs/MEMORIA_OPERATIVA.md) (estado, bloqueos y siguiente acción) y [`docs/DECISIONES.md`](docs/DECISIONES.md); contrastarlos con GitHub en vivo (rama predeterminada, PR e issues abiertos, CI del último SHA). Si difieren, prevalece GitHub en vivo y se corrige la memoria.
2. **Continuar sin duplicar:** retomar la siguiente acción registrada o el PR/rama existente sobre el mismo tema; no abrir PR, issues, documentos ni ramas paralelas que repitan trabajo en curso.
3. **Respetar las decisiones confirmadas:** solo el propietario las cambia, por instrucción expresa registrada en `docs/DECISIONES.md`.
4. **Actualizar la memoria al finalizar cada tarea**, en la misma rama/PR del cambio: estado vigente, siguiente acción y una entrada nueva en la bitácora de `docs/MEMORIA_OPERATIVA.md`.
5. **Registrar pruebas, bloqueos y siguiente acción concreta:** comando, entorno, SHA y resultado real (o `NO EJECUTADAS` con motivo); bloqueos con responsable; una sola acción siguiente ejecutable.
6. **Preservar y documentar cambios pendientes:** nada queda solo en local. Lo no terminado se sube a una rama y se anota (rama, SHA, PR o motivo) en la memoria; no se borran ramas, PR ni trabajo ajeno sin autorización.
7. **Repositorio como fuente oficial:** decisiones, estado y evidencias se escriben aquí; `docs/ESTADO_GITHUB_AUTO.md` es una instantánea automática que no sustituye ni modifica la memoria manual.

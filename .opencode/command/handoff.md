---
description: Gera o arquivo HANDOFF.md com todo o contexto da sessão (progresso, decisões, pendências) para continuar em outro chat LLM.
---

Você é responsável por gerar um arquivo de **handoff** completo da sessão atual, para que um outro LLM (sem histórico) consiga retomar o trabalho sem perder nada.

## Objetivo

Escrever o arquivo `HANDOFF.md` na raiz do projeto com o contexto integral da conversa.

## Coleta de contexto (obrigatória, nesta ordem)

1. Leia `git status --short` e `git diff --stat` para listar tudo que foi alterado.
2. Liste arquivos modificados/criados recentemente com `git status --short` e, se útil, `git diff` de arquivos-chave.
3. Leia `CONFORMIDADE-SEGURANCA-LGPD.md` (plano de segurança/LGPD do projeto) e verifique o status de cada item contra o estado real do código (o que foi feito, o que falta).
4. Leia o `todo` list ativo (ferramenta todowrite) e incorpore o status real de cada item.
5. Inspecione rapidamente os arquivos tocados para capturar decisões de implementação (métodos renomeados, libs adicionadas, funções de banco esperadas etc.).

## Estrutura obrigatória do HANDOFF.md

```markdown
# HANDOFF — <data/hora UTC>

## Objetivo da sessão
<1-3 frases>

## Progresso
- [ ] / [x] item — detalhe (referencie arquivos com caminho)

## Arquivos modificados/criados
- `<caminho>` — o que mudou e por quê

## Decisões técnicas
- decisão + justificativa (ex.: libs adicionadas ao package.json, mudança de fluxo de auth)

## Pendências / Bloqueadores
- o que falta fazer, o que depende de ação manual (dashboard, legal, chaves)

## Próximos passos sugeridos
- lista ordenada

## Comandos de validação
- `npm run build`, `npm run lint`, etc.

## Contexto de segurança/LGPD
- estado dos itens do CONFORMIDADE-SEGURANCA-LGPD.md (feito/não feito)
```

## Regras

- Preserve **toda substância técnica**: caminhos de arquivo, nomes de funções/tabelas, decisões, pendências.
- Não invente itens que não existem; se algo é só intenção, marque como pendente.
- Se `$ARGUMENTS` foi informado, use como nome alternativo do arquivo (ex.: `$ARGUMENTS.md`), senão use `HANDOFF.md`.
- Ao final, informe o caminho do arquivo gerado.

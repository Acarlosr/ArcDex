# Um saldo, duas interfaces: o que ajustamos no ArcDex antes da mainnet

Com a Arc Public Mainnet marcada para 16 de setembro, aproveitamos as últimas semanas para revisar o ArcDex — nosso app de swap e pagamentos — linha a linha contra a documentação da Arc. A ideia era simples: encontrar tudo que funciona por hábito de EVM, mas que a Arc trata de outro jeito.

O achado mais útil vale ser compartilhado, porque qualquer app que mova USDC na Arc passa por ele.

## USDC é uma bolsa só

Na Arc, o USDC é o gas token nativo e um contrato ERC-20 ao mesmo tempo. Duas interfaces, um saldo:

- **Nativo** — 18 casas decimais, lido com `getBalance`, é o que paga o gas
- **ERC-20** — 6 casas, em `0x3600000000000000000000000000000000000000`, é o que a lógica do app usa
- `1e18` nativo equivale a `1e6` ERC-20, e um precompile mantém os dois em sincronia

É um design elegante: o usuário não precisa segurar um token volátil só para transacionar. Mas ele muda uma suposição que carregamos de outras chains sem perceber.

## Onde isso aparece na prática

O botão MAX. Em qualquer EVM, MAX significa "pegue tudo": lê o `balanceOf` e joga o valor inteiro no campo. Funciona porque o gas sai de um saldo separado, em ETH.

Na Arc não existe saldo separado. Preencher 100% da interface ERC-20 significa não deixar nada para o gas, e a transação não consegue pagar por si mesma.

O ajuste é curto — reservar uma folga sempre que o token gasto for USDC:

```ts
const GAS_RESERVE_USDC = 0.5

const handleMaxClick = () => {
  const balance = parseFloat(fromBalance) || 0
  const max = fromToken === 'USDC'
    ? Math.max(0, balance - GAS_RESERVE_USDC)
    : balance
  setFromAmount(max.toFixed(6))
}
```

Aplicamos o mesmo em pagamentos, onde já descontávamos a taxa do protocolo mas ainda não o gas. E acrescentamos uma checagem do saldo nativo antes das ações, com link para o faucet: dá para ver um saldo cheio de USDC na tela e ainda assim não conseguir assinar nada, e agora a interface explica isso em vez de deixar o usuário no escuro.

O valor de folga é empírico, escolhido por nós — não é recomendação oficial da Circle. Ajuste ao perfil do seu app.

## Dois pontos vizinhos que vale conhecer

**Saldo duplicado na tela.** O material da Circle sobre as duas interfaces avisa que muitos SDKs assumem que nativo e ERC-20 são ativos diferentes e acabam mostrando o mesmo USDC duas vezes. Escrevemos a regra direto no código para que ela sobreviva a quem mexer depois: ERC-20 para tudo que o usuário vê, nativo apenas para checagem de gas, nunca somados.

**Logs de Transfer.** A Arc implementa o EIP-7708, então todo movimento nativo de USDC emite um log `Transfer` vindo de um endereço de sistema, em 18 casas — separado dos logs de 6 casas do contrato ERC-20. Nosso histórico lê o `txlist` do explorer, então não é afetado. Se você indexa com `eth_getLogs` ou `tokentx`, vale filtrar, senão o histórico mostra eventos duplicados e com magnitude errada.

## Checklist rápido

Se você tem swap, pagamento ou transferência rodando na Arc, vale um grep por:

- Controles de MAX ou "usar tudo" que gastam 100% de um saldo de USDC
- Checagem de gas antes da ação, não só checagem de saldo
- Exibições que possam somar saldo nativo com ERC-20
- Indexação de logs que assuma um evento `Transfer` por movimento

Nada disso é obscuro — está documentado. É justamente o tipo de coisa que passa despercebida porque o código *parece* certo à luz de outras chains.

## Fontes

- Building with USDC on Arc: one token, two interfaces (blog da Arc)
- EVM differences (docs.arc.io/arc/references/evm-differences)

---

O ArcDex roda na Arc Testnet, chain ID 5042002. Fazemos screening das carteiras conectadas contra um provedor de compliance e bloqueamos endereços sinalizados, então o app não está aberto a qualquer carteira.

Se alguém estiver passando por algo parecido enquanto se prepara para a mainnet, comenta aí — dá para trocar figurinha. Também esbarramos num detalhe de RPC dentro de um SDK da Circle enquanto montávamos as transferências crosschain; se houver interesse, escrevo em separado.

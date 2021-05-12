Como instalar o bot na sua maquina? Simples.

Execute o codigo utilizando o comando no terminal do node 'node index'. Sera gerado um codigo QR para se conectar ao Whatsapp Web. Apos escaneado sera gerado um arquivo chamado auth_info.json, nele estarao todas as informacoes para reconexao direta e automatica pelo programa.

Pegue todas as informacoes e substitua de acordo com a nomenclatura no arquivo .env, por exemplo:

CLIENTID="" para CLIENTID="qlJOg5FrVri8VD3K4AoKPA==" <= seu codigo sera outro, veja em seu arquivo auth_info

Feito isso remova as linhas 13,19 e 20 de seu codigo e retire as barras das linhas 4 e 18

Mude a conexao com o banco de acordo com o necessario.

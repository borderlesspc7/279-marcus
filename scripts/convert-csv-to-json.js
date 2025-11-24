/**
 * Script para converter CSV de alimentos TACO para JSON
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSV fornecido pelo usuário
const csvData = `ID,Alimento,calories,protein,fat,carbs,fiber
1,Arroz integral cozido,124,2.6,1.0,25.8,2.7
2,Arroz integral cru,360,7.3,1.9,77.5,4.8
3,Arroz tipo 1 cozido,128,2.5,0.2,28.1,1.6
4,Arroz tipo 1 cru,358,7.2,0.3,78.8,1.6
5,Arroz tipo 2 cozido,130,2.6,0.4,28.2,1.1
6,Arroz tipo 2 cru,358,7.2,0.3,78.9,1.7
7,Aveia flocos crua,394,13.9,8.5,66.6,9.1
8,Biscoito doce maisena,443,8.1,12.0,75.2,2.1
9,Biscoito doce recheado com chocolate,472,6.4,19.6,70.5,3.0
10,Biscoito doce recheado com morango,471,5.7,19.6,71.0,1.5
11,Biscoito doce wafer recheado de chocolate,502,5.6,24.7,67.5,1.8
12,Biscoito doce wafer recheado de morango,513,4.5,26.4,67.4,0.8
13,Biscoito salgado cream cracker,432,10.1,14.4,68.7,2.5
14,Bolo mistura para,419,6.2,6.1,84.7,1.7
15,Bolo pronto aipim,324,4.4,12.7,47.9,0.7
16,Bolo pronto chocolate,410,6.2,18.5,54.7,1.4
17,Bolo pronto coco,333,5.7,11.3,52.3,1.1
18,Bolo pronto milho,311,4.8,12.4,45.1,0.7
19,Canjica branca crua,358,7.2,1.0,78.1,5.5
20,Canjica com leite integral,112,2.4,1.2,23.6,1.2
21,Cereais milho flocos com sal,370,7.3,1.6,80.8,5.3
22,Cereais milho flocos sem sal,363,6.9,1.2,80.4,1.8
23,Cereais mingau milho infantil,394,6.4,1.1,87.3,3.2
24,Cereais mistura para vitamina trigo cevada e aveia,381,8.9,2.1,81.6,5.0
25,Cereal matinal milho,365,7.2,1.0,83.8,4.1
26,Cereal matinal milho açúcar,377,4.7,0.7,88.8,2.1
27,Creme de arroz pó,386,7.0,1.2,83.9,1.1
28,Creme de milho pó,333,4.8,1.6,86.1,3.7
29,Curau milho verde,78,2.4,1.6,13.9,0.5
30,Curau milho verde mistura para,402,2.2,13.4,79.8,2.5
31,Farinha de arroz enriquecida,363,1.3,0.3,85.5,0.6
32,Farinha de centeio integral,336,12.5,1.8,73.3,15.5
33,Farinha de milho amarela,351,7.2,1.5,79.1,5.5
34,Farinha de rosca,371,11.4,1.5,75.8,4.8
35,Farinha de trigo,360,9.8,1.4,75.1,2.3
36,Farinha láctea de cereais,415,11.9,5.8,77.8,1.9
37,Lasanha massa fresca cozida,164,5.8,1.2,32.5,1.6
38,Lasanha massa fresca crua,220,7.0,1.3,45.1,1.6
39,Macarrão instantâneo,436,8.8,17.2,62.4,5.6
40,Macarrão trigo cru,371,10.0,1.3,77.9,2.9
41,Macarrão trigo cru com ovos,371,10.3,2.0,76.6,2.3
42,Milho amido cru,361,0.6,Tr,87.1,0.7
43,Milho fubá cru,353,7.2,1.9,78.9,4.7
44,Milho verde cru,138,6.6,0.6,28.6,3.9
45,Milho verde enlatado drenado,98,3.2,2.4,17.1,4.6
46,Mingau tradicional pó,373,0.6,0.4,89.3,0.9
47,Pamonha barra para cozimento pré-cozida,171,2.6,4.8,30.7,2.4
48,Pão aveia forma,343,12.4,5.7,59.6,6.0
49,Pão de soja,309,11.3,3.6,56.5,5.7
50,Pão glúten forma,253,12.0,2.7,44.1,2.5
51,Pão milho forma,292,8.3,3.1,56.4,4.3
52,Pão trigo forma integral,253,9.4,3.7,49.9,6.9
53,Pão trigo francês,300,8.0,3.1,58.6,2.3
54,Pão trigo sovado,311,8.4,2.8,61.5,2.4
55,Pastel de carne cru,289,10.7,8.8,42.0,1.0
56,Pastel de carne frito,388,10.1,20.1,43.8,1.0
57,Pastel de queijo cru,308,9.9,9.6,45.9,1.1
58,Pastel de queijo frito,422,8.7,22.7,48.1,0.9
59,Pastel massa crua,310,6.9,5.5,57.4,1.4
60,Pastel massa frita,570,6.0,40.9,49.3,1.3
61,Pipoca com óleo de soja sem sal,448,9.9,15.9,70.3,14.3
62,Polenta pré-cozida,103,2.3,0.3,23.3,2.4
63,Torrada pão francês,377,10.5,3.3,74.6,3.4
64,Abóbora cabotian cozida,48,1.4,0.7,10.8,2.5
65,Abóbora cabotian crua,39,1.7,0.5,8.4,2.2
66,Abóbora menina brasileira crua,14,0.6,Tr,3.3,1.2
67,Abóbora moranga crua,12,1.0,0.1,2.7,1.7
68,Abóbora moranga refogada,29,0.4,0.8,6.0,1.5
69,Abóbora pescoço crua,24,0.7,0.1,6.1,2.3
70,Abobrinha italiana cozida,15,1.1,0.2,3.0,1.6
71,Abobrinha italiana crua,19,1.1,0.1,4.3,1.4
72,Abobrinha italiana refogada,24,1.1,0.8,4.2,1.4
73,Abobrinha paulista crua,31,0.6,0.1,7.9,2.6
74,Acelga crua,21,1.4,0.1,4.6,1.1
75,Agrião cru,17,2.7,0.2,2.3,2.1
76,Aipo cru,19,0.8,0.1,4.3,1.0
77,Alface americana crua,9,0.6,0.1,1.7,1.0
78,Alface crespa crua,11,1.3,0.2,1.7,1.8
79,Alface lisa crua,14,1.7,0.1,2.4,2.3
80,Alface roxa crua,13,0.9,0.2,2.5,2.0
81,Alfavaca crua,29,2.7,0.5,5.2,4.1
82,Alho cru,113,7.0,0.2,23.9,4.3
83,Alho-poró cru,32,1.4,0.1,6.9,2.5
84,Almeirão cru,18,1.8,0.2,3.3,2.6
85,Almeirão refogado,65,1.7,4.8,5.7,3.4
86,Batata baroa cozida,80,0.9,0.2,18.9,1.8
87,Batata baroa crua,101,1.0,0.2,24.0,2.1
88,Batata doce cozida,77,0.6,0.1,18.4,2.2
89,Batata doce crua,118,1.3,0.1,28.2,2.6
90,Batata frita tipo chips industrializada,543,5.6,36.6,51.2,2.5
91,Batata inglesa cozida,52,1.2,Tr,11.9,1.3
92,Batata inglesa crua,64,1.8,Tr,14.7,1.2
93,Batata inglesa frita,267,5.0,13.1,35.6,8.1
94,Batata inglesa sauté,68,1.3,0.9,14.1,1.4
95,Berinjela cozida,19,0.7,0.1,4.5,2.5
96,Berinjela crua,20,1.2,0.1,4.4,2.9
97,Beterraba cozida,32,1.3,0.1,7.2,1.9
98,Beterraba crua,49,1.9,0.1,11.1,3.4
99,Biscoito polvilho doce,438,1.3,12.2,80.5,1.2
100,Brócolis cozido,25,2.1,0.5,4.4,3.4
101,Brócolis cru,25,3.6,0.3,4.0,2.9
102,Cará cozido,78,1.5,0.1,18.9,2.6
103,Cará cru,96,2.3,0.1,23.0,7.3
104,Caruru cru,34,3.2,0.6,6.0,4.5
105,Catalonha crua,24,1.9,0.3,4.8,2.0
106,Catalonha refogada,63,2.0,4.8,4.8,3.7
107,Cebola crua,39,1.7,0.1,8.9,2.2
108,Cebolinha crua,20,1.9,0.4,3.4,3.6
109,Cenoura cozida,30,0.8,0.2,6.7,2.6
110,Cenoura crua,34,1.3,0.2,7.7,3.2
111,Chicória crua,14,1.1,0.1,2.9,2.2
112,Chuchu cozido,19,0.4,Tr,4.8,1.0
113,Chuchu cru,17,0.7,0.1,4.1,1.3
114,Coentro folhas desidratadas,309,20.9,10.4,48.0,37.3
115,Couve manteiga crua,27,2.9,0.5,4.3,3.1
116,Couve manteiga refogada,90,1.7,6.6,8.7,5.7
117,Couve-flor crua,23,1.9,0.2,4.5,2.4
118,Couve-flor cozida,19,1.2,0.3,3.9,2.1
119,Espinafre Nova Zelândia cru,16,2.0,0.2,2.6,2.1
120,Espinafre Nova Zelândia refogado,67,2.7,5.4,4.2,2.5
121,Farinha de mandioca crua,361,1.6,0.3,87.9,6.4
122,Farinha de mandioca torrada,365,1.2,0.3,89.2,6.5
123,Farinha de puba,360,1.6,0.5,87.3,4.2
124,Fécula de mandioca,331,0.5,0.3,81.1,0.6
125,Feijão broto cru,39,4.2,0.1,7.8,2.0
126,Inhame cru,97,2.1,0.2,23.2,1.7
127,Jiló cru,27,1.4,0.2,6.2,4.8
128,Jurubeba crua,126,4.4,3.9,23.1,23.9
129,Mandioca cozida,125,0.6,0.3,30.1,1.6
130,Mandioca crua,151,1.1,0.3,36.2,1.9
131,Mandioca farofa temperada,406,2.1,9.1,80.3,7.8
132,Mandioca frita,300,1.4,11.2,50.3,1.9
133,Manjericão cru,21,2.0,0.4,3.6,3.3
134,Maxixe cru,14,1.4,0.1,2.7,2.2
135,Mostarda folha crua,18,2.1,0.2,3.2,1.9
136,Nhoque batata cozido,181,5.9,1.9,36.8,1.8
137,Nabo cru,18,1.2,0.1,4.1,2.6
138,Palmito juçara em conserva,23,1.8,0.4,4.3,3.2
139,Palmito pupunha em conserva,29,2.5,0.5,5.5,2.6
140,Pão de queijo assado,363,5.1,24.6,34.2,0.6
141,Pão de queijo cru,295,3.6,14.0,38.5,1.0
142,Pepino cru,10,0.9,Tr,2.0,1.1
143,Pimentão amarelo cru,28,1.2,0.4,6.0,1.9
144,Pimentão verde cru,21,1.1,0.2,4.9,2.6
145,Pimentão vermelho cru,23,1.0,0.1,5.5,1.6
146,Polvilho doce,351,0.4,Tr,86.8,0.2
147,Quiabo cru,30,1.9,0.3,6.4,4.6
148,Rabanete cru,14,1.4,0.1,2.7,2.2
149,Repolho branco cru,17,0.9,0.1,3.9,1.9
150,Repolho roxo cru,31,1.9,0.1,7.2,2.0
151,Repolho roxo refogado,42,1.8,1.2,7.6,1.8
152,Rúcula crua,13,1.8,0.1,2.2,1.7
153,Salsa crua,33,3.3,0.6,5.7,1.9
154,Seleta de legumes enlatada,57,3.4,0.4,12.7,3.1
155,Serralha crua,30,2.7,0.7,4.9,3.5
156,Taioba crua,34,2.9,0.9,5.4,4.5
157,Tomate com semente cru,15,1.1,0.2,3.1,1.2
158,Tomate extrato,61,2.4,0.2,15.0,2.8
159,Tomate molho industrializado,38,1.4,0.9,7.7,3.1
160,Tomate purê,28,1.4,Tr,6.9,1.0
161,Tomate salada,21,0.8,Tr,5.1,2.3
162,Vagem crua,25,1.8,0.2,5.3,2.4
163,Abacate cru,96,1.2,8.4,6.0,6.3
164,Abacaxi cru,48,0.9,0.1,12.3,1.0
165,Abacaxi polpa congelada,31,0.5,0.1,7.8,0.3
166,Abiu cru,62,0.8,0.7,14.9,1.7
167,Açaí polpa com xarope de guaraná e glucose,110,0.7,3.7,21.5,1.7
168,Açaí polpa congelada,58,0.8,3.9,6.2,2.6
169,Acerola crua,33,0.9,0.2,8.0,1.5
170,Acerola polpa congelada,22,0.6,Tr,5.5,0.7
171,Ameixa calda enlatada,183,0.4,Tr,46.9,0.5
172,Ameixa crua,53,0.8,Tr,13.9,2.4
173,Ameixa em calda enlatada drenada,177,1.0,0.3,47.7,4.5
174,Atemóia crua,97,1.0,0.3,25.3,2.1
175,Banana da terra crua,128,1.4,0.2,33.7,1.5
176,Banana doce em barra,280,2.2,0.1,75.7,3.8
177,Banana figo crua,105,1.1,0.1,27.8,2.8
178,Banana maçã crua,87,1.8,0.1,22.3,2.6
179,Banana nanica crua,92,1.4,0.1,23.8,1.9
180,Banana ouro crua,112,1.5,0.2,29.3,2.0
181,Banana pacova crua,78,1.2,0.1,20.3,2.0
182,Banana prata crua,98,1.3,0.1,26.0,2.0
183,Cacau cru,74,1.0,0.1,19.4,2.2
184,Cajá-Manga cru,46,1.3,Tr,11.4,2.6
185,Cajá polpa congelada,26,0.6,0.2,6.4,1.4
186,Caju cru,43,1.0,0.3,10.3,1.7
187,Caju polpa congelada,37,0.5,0.2,9.4,0.8
188,Caju suco concentrado envasado,45,0.4,0.2,10.7,0.6
189,Caqui chocolate cru,71,0.4,0.1,19.3,6.5
190,Carambola crua,46,0.9,0.2,11.5,2.0
191,Ciriguela crua,76,1.4,0.4,18.9,3.9
192,Cupuaçu cru,49,1.2,1.0,10.4,3.1
193,Cupuaçu polpa congelada,49,0.8,0.6,11.4,1.6
194,Figo cru,41,1.0,0.2,10.2,1.8
195,Figo enlatado em calda,184,0.6,0.2,50.3,2.0
196,Fruta-pão crua,67,1.1,0.2,17.2,5.5
197,Goiaba branca com casca crua,52,0.9,0.5,12.4,6.3
198,Goiaba doce em pasta,269,0.6,0.0,74.1,3.7
199,Goiaba doce cascão,286,0.4,0.1,78.7,4.4
200,Goiaba vermelha com casca crua,54,1.1,0.4,13.0,6.2
201,Graviola crua,62,0.8,0.2,15.8,1.9
202,Graviola polpa congelada,38,0.6,0.1,9.8,1.2
203,Jabuticaba crua,58,0.6,0.1,15.3,2.3
204,Jaca crua,88,1.4,0.3,22.5,2.4
205,Jambo cru,27,0.9,0.1,6.5,5.1
206,Jamelão cru,41,0.5,0.1,10.6,1.8
207,Kiwi cru,51,1.3,0.6,11.5,2.7
208,Laranja baía crua,45,1.0,0.1,11.5,1.1
209,Laranja baía suco,37,0.7,Tr,8.7,Tr
210,Laranja da terra crua,51,1.1,0.2,12.9,4.0
211,Laranja da terra suco,41,0.7,0.1,9.6,1.0
212,Laranja lima crua,46,1.1,0.1,11.5,1.8
213,Laranja lima suco,39,0.7,0.1,9.2,0.4
214,Laranja pêra crua,37,1.0,0.1,8.9,0.8
215,Laranja pêra suco,33,0.7,0.1,7.6,Tr
216,Laranja valência crua,46,0.8,0.2,11.7,1.7
217,Laranja valência suco,36,0.5,0.1,8.6,0.4
218,Limão cravo suco,14,0.3,Tr,5.2,Tr
219,Limão galego suco,22,0.6,0.1,7.3,Tr
220,Limão tahiti cru,32,0.9,0.1,11.1,1.2
221,Maçã Argentina com casca crua,63,0.2,0.2,16.6,2.0
222,Maçã Fuji com casca crua,56,0.3,Tr,15.2,1.3
223,Macaúba crua,404,2.1,40.7,13.9,13.4
224,Mamão doce em calda drenado,196,0.2,0.1,54.0,1.3
225,Mamão Formosa cru,45,0.8,0.1,11.6,1.8
226,Mamão Papaia cru,40,0.5,0.1,10.4,1.0
227,Mamão verde doce em calda drenado,209,0.3,0.1,57.6,1.2
228,Manga Haden crua,64,0.4,0.3,16.7,1.6
229,Manga Palmer crua,72,0.4,0.2,19.4,1.6
230,Manga polpa congelada,48,0.4,0.2,12.5,1.1
231,Manga Tommy Atkins crua,51,0.9,0.2,12.8,2.1
232,Maracujá cru,68,2.0,2.1,12.3,1.1
233,Maracujá polpa congelada,39,0.8,0.2,9.6,0.5
234,Maracujá suco concentrado envasado,42,0.8,0.2,9.6,0.4
235,Melancia crua,33,0.9,Tr,8.1,0.1
236,Melão cru,29,0.7,Tr,7.5,0.3
237,Mexerica Murcote crua,58,0.9,0.1,14.9,3.1
238,Mexerica Rio crua,37,0.7,0.1,9.3,2.7
239,Morango cru,30,0.9,0.3,6.8,1.7
240,Nêspera crua,43,0.3,Tr,11.5,3.0
241,Pequi cru,205,2.3,18.0,13.0,19.0
242,Pêra Park crua,61,0.2,0.2,16.1,3.0
243,Pêra Williams crua,53,0.6,0.1,14.0,3.0
244,Pêssego Aurora cru,36,0.8,Tr,9.3,1.4
245,Pêssego enlatado em calda,63,0.7,Tr,16.9,1.0
246,Pinha crua,88,1.5,0.3,22.4,3.4
247,Pitanga crua,41,0.9,0.2,10.2,3.2
248,Pitanga polpa congelada,19,0.3,0.1,4.8,0.7
249,Romã crua,56,0.4,Tr,15.1,0.4
250,Tamarindo cru,276,3.2,0.5,72.5,6.4
251,Tangerina Poncã crua,38,0.8,0.1,9.6,0.9
252,Tangerina Poncã suco,36,0.5,Tr,8.8,Tr
253,Tucumã cru,262,2.1,19.1,26.5,12.7
254,Umbu cru,37,0.8,Tr,9.4,2.0
255,Umbu polpa congelada,34,0.5,0.1,8.8,1.3
256,Uva Itália crua,53,0.7,0.2,13.6,0.9
257,Uva Rubi crua,49,0.6,0.2,12.7,0.9
258,Uva suco concentrado envasado,58,Tr,Tr,14.7,0.2
259,Azeite de dendê,884,NA,100.0,NA,NA
260,Azeite de oliva extra virgem,884,NA,100.0,NA,NA
261,Manteiga com sal,726,0.4,82.4,0.1,NA
262,Manteiga sem sal,758,0.4,86.0,0.1,NA
263,Margarina com óleo hidrogenado com sal (65% de lipídeos),596,Tr,67.4,0.0,NA
264,Margarina com óleo hidrogenado sem sal (80% de lipídeos),723,Tr,81.7,0.0,NA
265,Margarina com óleo interesterificado com sal (65% de lipideos),594,Tr,67.2,0.0,NA
266,Margarina com óleo interesterificado sem sal (65% de lipídeos),593,Tr,67.1,0.0,NA
267,Óleo de babaçu,884,NA,100.0,NA,NA
268,Óleo de canola,884,NA,100.0,NA,NA
269,Óleo de girassol,884,NA,100.0,NA,NA
270,Óleo de milho,884,NA,100.0,NA,NA
271,Óleo de pequi,884,NA,100.0,NA,NA
272,Óleo de soja,884,NA,100.0,NA,NA
273,Abadejo filé congelado assado,112,23.5,1.2,0.0,NA
274,Abadejo filé congelado cozido,91,19.3,0.9,0.0,NA
275,Abadejo filé congelado cru,59,13.1,0.4,0.0,NA
276,Abadejo filé congelado grelhado,130,27.6,1.3,0.0,NA
277,Atum conserva em óleo,166,26.2,6.0,0.0,NA
278,Atum fresco cru,118,25.7,0.9,0.0,NA
279,Bacalhau salgado cru,136,29.0,1.3,0.0,NA
280,Bacalhau salgado refogado,140,24.0,3.6,1.2,NA
281,Cação posta com farinha de trigo frita,208,25.0,10.0,3.1,0.5
282,Cação posta cozida,116,25.6,0.7,0.0,NA
283,Cação posta crua,83,17.9,0.8,0.0,NA
284,Camarão Rio Grande grande cozido,90,19.0,1.0,0.0,NA
285,Camarão Rio Grande grande cru,47,10.0,0.5,0.0,NA
286,Camarão Sete Barbas sem cabeça com casca frito,231,18.4,15.6,2.9,NA
287,Caranguejo cozido,83,18.5,0.4,0.0,NA
288,Corimba cru,128,17.4,6.0,0.0,NA
289,Corimbatá assado,261,19.9,19.6,0.0,NA
290,Corimbatá cozido,239,20.1,16.9,0.0,NA
291,Corvina de água doce crua,101,18.9,2.2,0.0,NA
292,Corvina do mar crua,94,18.6,1.6,0.0,NA
293,Corvina grande assada,147,26.8,3.6,0.0,NA
294,Corvina grande cozida,100,23.4,2.6,0.0,NA
295,Dourada de água doce fresca,131,18.8,5.6,0.0,NA
296,Lambari congelado cru,131,16.8,6.5,0.0,NA
297,Lambari congelado frito,327,28.4,22.8,0.0,NA
298,Lambari fresco cru,152,15.7,9.4,0.0,NA
299,Manjuba com farinha de trigo frita,344,23.5,22.6,10.2,0.4
300,Manjuba frita,349,30.1,24.5,0.0,NA
301,Merluza filé assado,122,26.6,0.9,0.0,NA
302,Merluza filé cru,89,16.6,2.0,0.0,NA
303,Merluza filé frito,192,26.9,8.5,0.0,NA
304,Pescada branca crua,111,16.3,4.6,0.0,NA
305,Pescada branca frita,223,27.4,11.8,0.0,NA
306,Pescada filé com farinha de trigo frito,283,21.4,19.1,12.2,0.4
307,Pescada filé cru,107,16.7,4.0,0.0,NA
308,Pescada filé frito,154,28.6,3.6,0.0,NA
309,Pescada filé molho escabeche,142,11.8,8.0,5.0,0.8
310,Pescadinha crua,76,15.5,1.1,0.0,NA
311,Pintado assado,192,36.5,4.0,0.0,NA
312,Pintado cru,91,18.6,1.3,0.0,NA
313,Pintado grelhado,152,30.8,2.3,0.0,NA
314,Porquinho cru,93,20.5,0.6,0.0,NA
315,Salmão filé com pele fresco grelhado,229,23.9,14.0,0.0,NA
316,Salmão sem pele fresco cru,170,19.3,9.7,0.0,NA
317,Salmão sem pele fresco grelhado,243,26.1,14.5,0.0,NA
318,Sardinha assada,164,32.2,3.0,0.0,NA
319,Sardinha conserva em óleo,285,15.9,24.0,0.0,NA
320,Sardinha frita,257,33.4,12.7,0.0,NA
321,Sardinha inteira crua,114,21.1,2.7,0.0,NA
322,Tucunaré filé congelado cru,88,18.0,1.2,0.0,NA
323,Apresuntado,129,13.5,6.7,2.9,NA
324,Caldo de carne tablete,241,7.8,16.6,15.1,0.6
325,Caldo de galinha tablete,251,6.3,20.4,10.6,11.8
326,Carne bovina acém moído cozido,212,26.7,10.9,0.0,NA
327,Carne bovina acém moído cru,137,19.4,5.9,0.0,NA
328,Carne bovina acém sem gordura cozido,215,27.3,10.9,0.0,NA
329,Carne bovina acém sem gordura cru,144,20.8,6.1,0.0,NA
330,Carne bovina almôndegas cruas,189,12.3,11.2,9.8,NA
331,Carne bovina almôndegas fritas,272,18.2,15.8,14.3,NA
332,Carne bovina bucho cozido,133,21.6,4.5,0.0,NA
333,Carne bovina bucho cru,137,20.5,5.5,0.0,NA
334,Carne bovina capa de contra-filé com gordura crua,217,19.2,15.0,0.0,NA
335,Carne bovina capa de contra-filé com gordura grelhada,312,30.7,20.0,0.0,NA
336,Carne bovina capa de contra-filé sem gordura crua,131,21.5,4.3,0.0,NA
337,Carne bovina capa de contra-filé sem gordura grelhada,239,35.1,10.0,0.0,NA
338,Carne bovina charque cozido,263,36.4,11.9,0.0,NA
339,Carne bovina charque cru,249,22.7,16.8,0.0,NA
340,Carne bovina contra-filé à milanesa,352,20.6,24.0,12.2,0.4
341,Carne bovina contra-filé de costela cru,202,19.8,13.1,0.0,NA
342,Carne bovina contra-filé de costela grelhado,275,29.9,16.3,0.0,NA
343,Carne bovina contra-filé com gordura cru,206,21.2,12.8,0.0,NA
344,Carne bovina contra-filé com gordura grelhado,278,32.4,15.5,0.0,NA
345,Carne bovina contra-filé sem gordura cru,157,24.0,6.0,0.0,NA
346,Carne bovina contra-filé sem gordura grelhado,194,35.9,4.5,0.0,NA
347,Carne bovina costela assada,373,28.8,27.7,0.0,NA
348,Carne bovina costela crua,358,16.7,31.8,0.0,NA
349,Carne bovina coxão duro sem gordura cozido,217,31.9,8.9,0.0,NA
350,Carne bovina coxão duro sem gordura cru,148,21.5,6.2,0.0,NA
351,Carne bovina coxão mole sem gordura cozido,219,32.4,8.9,0.0,NA
352,Carne bovina coxão mole sem gordura cru,169,21.2,8.7,0.0,NA
353,Carne bovina cupim assado,330,28.6,23.0,0.0,NA
354,Carne bovina cupim cru,221,19.5,15.3,0.0,NA
355,Carne bovina fígado cru,141,20.7,5.4,1.1,NA
356,Carne bovina fígado grelhado,225,29.9,9.0,4.2,NA
357,Carne bovina filé mingnon sem gordura cru,143,21.6,5.6,0.0,NA
358,Carne bovina filé mingnon sem gordura grelhado,220,32.8,8.8,0.0,NA
359,Carne bovina flanco sem gordura cozido,196,29.4,7.8,0.0,NA
360,Carne bovina flanco sem gordura cru,141,20.0,6.2,0.0,NA
361,Carne bovina fraldinha com gordura cozida,338,24.2,26.0,0.0,NA
362,Carne bovina fraldinha com gordura crua,221,17.6,16.1,0.0,NA
363,Carne bovina lagarto cozido,222,32.9,9.1,0.0,NA
364,Carne bovina lagarto cru,135,20.5,5.2,0.0,NA
365,Carne bovina língua cozida,315,21.4,24.8,0.0,NA
366,Carne bovina língua crua,215,17.1,15.8,0.0,NA
367,Carne bovina maminha crua,153,20.9,7.0,0.0,NA
368,Carne bovina maminha grelhada,153,30.7,2.4,0.0,NA
369,Carne bovina miolo de alcatra sem gordura cru,163,21.6,7.8,0.0,NA
370,Carne bovina miolo de alcatra sem gordura grelhado,241,31.9,11.6,0.0,NA
371,Carne bovina músculo sem gordura cozido,194,31.2,6.7,0.0,NA
372,Carne bovina músculo sem gordura cru,142,21.6,5.5,0.0,NA
373,Carne bovina paleta com gordura crua,159,21.4,7.5,0.0,NA
374,Carne bovina paleta sem gordura cozida,194,29.7,7.4,0.0,NA
375,Carne bovina paleta sem gordura crua,141,21.0,5.7,0.0,NA
376,Carne bovina patinho sem gordura cru,133,21.7,4.5,0.0,NA
377,Carne bovina patinho sem gordura grelhado,219,35.9,7.3,0.0,NA
378,Carne bovina peito sem gordura cozido,338,22.2,27.0,0.0,NA
379,Carne bovina peito sem gordura cru,259,17.6,20.4,0.0,NA
380,Carne bovina picanha com gordura crua,213,18.8,14.7,0.0,NA
381,Carne bovina picanha com gordura grelhada,289,26.4,19.5,0.0,NA
382,Carne bovina picanha sem gordura crua,134,21.3,4.7,0.0,NA
383,Carne bovina picanha sem gordura grelhada,238,31.9,11.3,0.0,NA
384,Carne bovina seca cozida,313,26.9,21.9,0.0,NA
385,Carne bovina seca crua,313,19.7,25.4,0.0,NA
386,Coxinha de frango frita,283,9.6,11.8,34.5,5.0
387,Croquete de carne cru,246,12.0,15.6,13.9,NA
388,Croquete de carne frito,347,16.9,22.7,18.1,NA
389,Empada de frango pré-cozida assada,358,6.9,15.6,47.5,2.2
390,Empada de frango pré-cozida,377,7.3,22.9,35.5,2.2
391,Frango asa com pele crua,213,18.1,15.1,0.0,NA
392,Frango caipira inteiro com pele cozido,243,23.9,15.6,0.0,NA
393,Frango caipira inteiro sem pele cozido,196,29.6,7.7,0.0,NA
394,Frango coração cru,222,12.6,18.6,0.0,NA
395,Frango coração grelhado,207,22.4,12.1,0.6,NA
396,Frango coxa com pele assada,215,28.5,10.4,0.1,NA
397,Frango coxa com pele crua,161,17.1,9.8,0.0,NA
398,Frango coxa sem pele cozida,167,26.9,5.8,0.0,NA
399,Frango coxa sem pele crua,120,17.8,4.9,0.0,NA
400,Frango fígado cru,106,17.6,3.5,0.0,NA
401,Frango filé à milanesa,221,28.5,7.8,7.5,1.1
402,Frango inteiro com pele cru,226,16.4,17.3,0.0,NA
403,Frango inteiro sem pele assado,187,28.0,7.5,0.0,NA
404,Frango inteiro sem pele cozido,170,25.0,7.1,0.0,NA
405,Frango inteiro sem pele cru,129,20.6,4.6,0.0,NA
406,Frango peito com pele assado,212,33.4,7.6,0.0,NA
407,Frango peito com pele cru,149,20.8,6.7,0.0,NA
408,Frango peito sem pele cozido,163,31.5,3.2,0.0,NA
409,Frango peito sem pele cru,119,21.5,3.0,0.0,NA
410,Frango peito sem pele grelhado,159,32.0,2.5,0.0,NA
411,Frango sobrecoxa com pele assada,260,28.7,15.2,0.0,NA
412,Frango sobrecoxa com pele crua,255,15.5,20.9,0.0,NA
413,Frango sobrecoxa sem pele assada,233,29.2,12.0,0.0,NA
414,Frango sobrecoxa sem pele crua,162,17.6,9.6,0.0,NA
415,Hambúrguer bovino cru,215,13.2,16.2,4.2,NA
416,Hambúrguer bovino frito,258,20.0,17.0,6.3,NA
417,Hambúrguer bovino grelhado,210,13.2,12.4,11.3,NA
418,Lingüiça frango crua,218,14.2,17.4,0.0,NA
419,Lingüiça frango frita,245,18.3,18.5,0.0,NA
420,Lingüiça frango grelhada,244,18.2,18.4,0.0,NA
421,Lingüiça porco crua,227,16.1,17.6,0.0,NA
422,Lingüiça porco frita,280,20.5,21.3,0.0,NA
423,Lingüiça porco grelhada,296,23.2,21.9,0.0,NA
424,Mortadela,269,12.0,21.6,5.8,NA
425,Peru congelado assado,163,26.2,5.7,0.0,NA
426,Peru congelado cru,94,18.1,1.8,0.0,NA
427,Porco bisteca crua,164,21.5,8.0,0.0,NA
428,Porco bisteca frita,311,33.7,18.5,0.0,NA
429,Porco bisteca grelhada,280,28.9,17.4,0.0,NA
430,Porco costela assada,402,30.2,30.3,0.0,NA
431,Porco costela crua,256,18.0,19.8,0.0,NA
432,Porco lombo assado,210,35.7,6.4,0.0,NA
433,Porco lombo cru,176,22.6,8.8,0.0,NA
434,Porco orelha salgada crua,258,18.5,19.9,0.0,NA
435,Porco pernil assado,262,32.1,13.9,0.0,NA
436,Porco pernil cru,186,20.1,11.1,0.0,NA
437,Porco rabo salgado cru,377,15.6,34.5,0.0,NA
438,Presunto com capa de gordura,128,14.4,6.8,1.4,NA
439,Presunto sem capa de gordura,94,14.3,2.7,2.1,NA
440,Quibe assado,136,14.6,2.7,12.9,1.9
441,Quibe cru,109,12.4,1.7,10.8,1.6
442,Quibe frito,254,14.9,15.8,12.3,NA
443,Salame,398,25.8,30.6,2.9,NA
444,Toucinho cru,593,11.5,60.3,0.0,NA
445,Toucinho frito,697,27.3,64.3,0.0,NA
446,Bebida láctea pêssego,55,2.1,1.9,7.6,0.3
447,Creme de Leite,221,1.5,22.5,4.5,NA
448,Iogurte natural,51,4.1,3.0,1.9,NA
449,Iogurte natural desnatado,41,3.8,0.3,5.8,NA
451,Iogurte sabor morango,70,2.7,2.3,9.7,0.2
452,Iogurte sabor pêssego,68,2.5,2.3,9.4,0.7
453,Leite condensado,313,7.7,6.7,57.0,NA
454,Leite de cabra,66,3.1,3.8,5.2,NA
455,Leite de vaca achocolatado,83,2.1,2.2,14.2,0.6
456,Leite de vaca desnatado pó,362,34.7,0.9,53.0,NA
458,Leite de vaca integral,63,3.3,3.5,4.8,NA
459,Leite de vaca integral pó,497,25.4,26.9,39.2,NA
460,Leite fermentado,70,1.9,0.1,15.7,NA
461,Queijo minas frescal,264,17.4,20.2,3.2,NA
462,Queijo minas meia cura,321,21.2,24.6,3.6,NA
463,Queijo mozarela,330,22.6,25.2,3.0,NA
464,Queijo parmesão,453,35.6,33.5,1.7,NA
465,Queijo pasteurizado,303,9.4,27.4,5.7,NA
466,Queijo petit suisse morango,121,5.8,2.8,18.5,NA
467,Queijo prato,360,22.7,29.1,1.9,NA
468,Queijo requeijão cremoso,257,9.6,23.4,2.4,NA
469,Queijo ricota,140,12.6,8.1,3.8,NA
470,Bebida isotônica sabores variados,26,0.0,0.0,6.4,NA
471,Café infusão 10%,9,0.7,0.1,1.5,NA
472,Cana aguardente,216,Tr,Tr,Tr,NA
473,Cana caldo de,65,Tr,Tr,18.2,0.1
474,Cerveja pilsen 2,41,0.6,Tr,3.3,NA
475,Chá erva-doce infusão 5%,1,0.0,0.0,0.4,NA
476,Chá mate infusão 5%,3,0.0,0.1,0.6,NA
477,Chá preto infusão 5%,2,0.0,0.0,0.6,NA
478,Coco água de,22,0.0,0.0,5.3,0.1
479,Refrigerante tipo água tônica,31,0.0,0.0,8.0,NA
480,Refrigerante tipo cola,34,0.0,0.0,8.7,NA
481,Refrigerante tipo guaraná,39,0.0,0.0,10.0,NA
482,Refrigerante tipo laranja,46,0.0,0.0,11.8,NA
483,Refrigerante tipo limão,40,0.0,0.0,10.3,NA
484,Omelete de queijo,268,15.6,22.0,0.4,NA
485,Ovo de codorna inteiro cru,177,13.7,12.7,0.8,NA
486,Ovo de galinha clara cozida/10minutos,59,13.4,0.1,0.0,NA
487,Ovo de galinha gema cozida/10minutos,353,15.9,30.8,1.6,NA
488,Ovo de galinha inteiro cozido/10minutos,146,13.3,9.5,0.6,NA
489,Ovo de galinha inteiro cru,143,13.0,8.9,1.6,NA
490,Ovo de galinha inteiro frito,240,15.6,18.6,1.2,NA
491,Achocolatado pó,401,4.2,2.2,91.2,3.9
492,Açúcar cristal,387,0.3,Tr,99.6,NA
493,Açúcar mascavo,369,0.8,0.1,94.5,NA
494,Açúcar refinado,387,0.3,Tr,99.5,NA
495,Chocolate ao leite,540,7.2,30.3,59.6,2.2
496,Chocolate ao leite com castanha do Pará,559,7.4,34.2,55.4,2.5
497,Chocolate ao leite dietético,557,6.9,33.8,56.3,2.8
498,Chocolate meio amargo,475,4.9,29.9,62.4,4.9
499,Cocada branca,449,1.1,13.6,81.4,3.6
500,Doce de abóbora cremoso,199,0.9,0.2,54.6,2.3
501,Doce de leite cremoso,306,5.5,6.0,59.5,NA
502,Geléia mocotó natural,106,2.1,0.1,24.2,NA
503,Glicose de milho,292,0.0,0.0,79.4,NA
504,Maria mole,301,3.8,0.2,73.6,0.7
505,Maria mole coco queimado,307,3.9,0.1,75.1,0.6
506,Marmelada,257,0.4,0.1,70.8,4.1
507,Mel de abelha,309,0.0,0.0,84.0,NA
508,Melado,297,0.0,0.0,76.6,NA
509,Quindim,411,4.7,24.4,46.3,3.2
510,Rapadura,352,1.0,0.1,90.8,NA
511,Café pó torrado,419,14.7,11.9,65.8,51.2
512,Capuccino pó,417,11.3,8.6,73.6,2.4
513,Fermento em pó químico,90,0.5,0.1,43.9,NA
514,Fermento biológico levedura tablete,90,17.0,1.5,7.7,4.2
515,Gelatina sabores variados pó,380,8.9,Tr,89.2,NA
516,Sal dietético,NA,NA,NA,NA,NA
517,Sal grosso,NA,NA,NA,NA,NA
518,Shoyu,61,3.3,0.3,11.6,NA
519,Tempero a base de sal,21,2.7,0.3,2.1,0.6
520,Azeitona preta conserva,194,1.2,20.3,5.5,4.6
521,Azeitona verde conserva,137,0.9,14.2,4.1,3.8
522,Chantilly spray com gordura vegetal,315,0.5,27.3,16.9,NA
523,Leite de coco,166,1.0,18.4,2.2,0.7
524,Maionese tradicional com ovos,302,0.6,30.5,7.9,NA
525,Acarajé,289,8.3,19.9,19.1,9.4
526,Arroz carreteiro,154,10.8,7.1,11.6,1.5
527,Baião de dois arroz e feijão-de-corda,136,6.2,3.2,20.4,5.1
528,Barreado,165,18.3,9.5,0.2,0.1
529,Bife à cavalo com contra filé,291,23.7,21.1,0.0,NA
530,Bolinho de arroz,274,8.0,8.3,41.7,2.7
531,Camarão à baiana,101,7.9,6.0,3.2,0.4
532,Charuto de repolho,78,6.8,1.1,10.1,1.5
533,Cuscuz de milho cozido com sal,113,2.2,0.7,25.3,2.1
534,Cuscuz paulista,142,2.6,4.6,22.5,2.4
535,Cuxá molho,80,5.6,3.6,5.7,3.0
536,Dobradinha,125,19.8,4.4,0.0,NA
537,Estrogonofe de carne,173,15.0,10.8,3.0,NA
538,Estrogonofe de frango,157,17.6,8.0,2.6,NA
539,Feijão tropeiro mineiro,152,10.2,6.8,19.6,3.6
540,Feijoada,117,8.7,6.5,11.6,5.1
541,Frango com açafrão,113,9.7,6.2,4.1,0.2
542,Macarrão molho bolognesa,120,4.9,0.9,22.5,0.8
543,Maniçoba,134,10.0,8.7,3.4,2.2
544,Quibebe,86,8.6,2.7,6.6,1.7
545,Salada de legumes com maionese,96,1.1,7.0,8.9,2.2
546,Salada de legumes cozida no vapor,35,2.0,0.3,7.1,2.5
547,Salpicão de frango,148,13.9,7.8,4.6,0.4
548,Sarapatel,123,18.5,4.4,1.1,NA
549,Tabule,57,2.0,1.2,10.6,2.1
550,Tacacá,47,7.0,0.4,3.4,0.2
551,Tapioca com manteiga,348,0.1,10.9,63.6,Tr
552,Tucupi com pimenta-de-cheiro,27,2.1,0.3,4.7,0.2
553,Vaca atolada,145,5.1,9.3,10.1,2.3
554,Vatapá,255,6.0,23.2,9.7,1.7
555,Virado à paulista,307,10.2,25.6,14.1,2.2
556,Yakisoba,113,7.5,2.6,18.3,1.1
557,Amendoim grão cru,544,27.2,43.9,20.3,8.0
558,Amendoim torrado salgado,606,22.5,54.0,18.7,7.8
559,Ervilha em vagem,88,7.5,0.5,14.2,9.7
560,Ervilha enlatada drenada,74,4.6,0.4,13.4,5.1
561,Feijão carioca cozido,76,4.8,0.5,13.6,8.5
562,Feijão carioca cru,329,20.0,1.3,61.2,18.4
563,Feijão fradinho cozido,78,5.1,0.6,13.5,7.5
564,Feijão fradinho cru,339,20.2,2.4,61.2,23.6
565,Feijão jalo cozido,93,6.1,0.5,16.5,13.9
566,Feijão jalo cru,328,20.1,0.9,61.5,30.3
567,Feijão preto cozido,77,4.5,0.5,14.0,8.4
568,Feijão preto cru,324,21.3,1.2,58.8,21.8
569,Feijão rajado cozido,85,5.5,0.4,15.3,9.3
570,Feijão rajado cru,326,17.3,1.2,62.9,24.0
571,Feijão rosinha cozido,68,4.5,0.5,11.8,4.8
572,Feijão rosinha cru,337,20.9,1.3,62.2,20.6
573,Feijão roxo cozido,77,5.7,0.5,12.9,11.5
574,Feijão roxo cru,331,22.2,1.2,60.0,33.8
575,Grão-de-bico cru,355,21.2,5.4,57.9,12.4
576,Guandu cru,344,19.0,2.1,64.0,21.3
577,Lentilha cozida,93,6.3,0.5,16.3,7.9
578,Lentilha crua,339,23.2,0.8,62.0,16.9
579,Paçoca amendoim,487,16.0,26.1,52.4,7.3
580,Pé-de-moleque amendoim,503,13.2,28.0,54.7,3.4
581,Soja farinha,404,36.0,14.6,38.4,20.2
582,Soja extrato solúvel natural fluido,39,2.4,1.6,4.3,0.4
583,Soja extrato solúvel pó,459,35.7,26.2,28.5,7.3
584,Soja queijo (tofu),64,6.6,4.0,2.1,0.8
585,Tremoço cru,381,33.6,10.3,43.8,32.3
586,Tremoço em conserva,121,11.1,3.8,12.4,14.4
587,Amêndoa torrada salgada,581,18.6,47.3,29.5,11.6
588,Castanha-de-caju torrada salgada,570,18.5,46.3,29.1,3.7
589,Castanha-do-Brasil crua,643,14.5,63.5,15.1,7.9
590,Coco cru,406,3.7,42.0,10.4,5.4
591,Coco verde cru,*,*,*,*,*
592,Farinha de mesocarpo de babaçu crua,329,1.4,0.2,79.2,17.9
593,Gergelim semente,584,21.2,50.4,21.6,11.9
594,Linhaça semente,495,14.1,32.3,43.3,33.5
595,Pinhão cozido,174,3.0,0.7,43.9,15.6
596,Pupunha cozida,219,2.5,12.8,29.6,4.3
597,Noz crua,620,14.0,59.4,18.4,7.2`;

// Função para categorizar alimentos
function categorizeFood(name) {
  const n = name.toLowerCase();
  
  if (n.match(/(abacate|abacaxi|acerola|amora|ananás|atemóia|banana|caju|figo|goiaba|graviola|jabuticaba|jambo|kiwi|laranja|limão|mamão|manga|melancia|melão|morango|nêspera|pêra|pêssego|pinha|pitanga|romã|tamarindo|tangerina|tucumã|umbu|uva|ameixa|abiu|açaí|cacau|cajá|caqui|carambola|ciriguela|cupuaçu|fruta-pão|jaca|jamelão|maracujá|mexerica|macaúba)/)) {
    return "Frutas";
  }
  
  if (n.match(/(abóbora|abobrinha|alface|alho|almeirão|azedinha|beterraba|brócolis|cebola|cenoura|chuchu|couve|ervilha|espinafre|maxixe|nabo|pepino|pimentão|quiabo|rabanete|repolho|rúcula|serralha|taioba|tomate|vagem|acelga|agrião|aipo|alfavaca|alho-poró|batata|berinjela|cará|caruru|catalonha|cebolinha|chicória|coentro|jurubeba|jiló|manjericão|mostarda|palmito)/)) {
    return "Vegetais";
  }
  
  if (n.match(/(carne|frango|peito|coxa|sobrecoxa|peru|porco|bovina|suína|bisteca|costela|lombo|pernil|alcatra|maminha|patinho|picanha|contra-filé|filé|mignon|cupim|tatu|lagarto|língua|fígado|miúdos|coração|asa|presunto|salame|linguiça|hambúrguer|almôndega|croquete|coxinha|bucho|charque|seca|fraldinha|paleta|peito|miolo|músculo|flanco|coxa|coxão|apresuntado|mortadela|toucinho)/)) {
    return "Proteínas";
  }
  
  if (n.match(/(peixe|pescada|salmão|atum|sardinha|tilápia|corvina|pintado|tucunaré|abadejo|bacalhau|cação|camarão|caranguejo|ostra|mariscos|corimba|corimbatá|dourada|lambari|manjuba|merluza|pescadinha|porquinho)/)) {
    return "Proteínas";
  }
  
  if (n.match(/(ovo|ovos|omelete)/)) {
    return "Proteínas";
  }
  
  if (n.match(/(arroz|milho|aveia|trigo|cevada|centeio|quinoa|cuscuz|tapioca|mandioca|inhame|batata|cará|canjica|polenta|farinha|lasanha|macarrão|mingau|pamonha|pão|pastel|pipoca|torrada|beiju|fubá|amido|creme|fécula|polvilho)/)) {
    return "Carboidratos";
  }
  
  if (n.match(/(feijão|feijoes|feijões|lentilha|grão-de-bico|ervilha|soja|tremoço|guandu)/)) {
    return "Leguminosas";
  }
  
  if (n.match(/(leite|queijo|iogurte|requeijão|ricota|mussarela|parmesão|cottage|creme|manteiga|margarina|chantilly|bebida láctea|fermentado)/)) {
    return "Laticínios";
  }
  
  if (n.match(/(amendoim|castanha|amêndoa|noz|avelã|pistache|macadâmia|gergelim|linhaça|pinhão|pupunha|coco|macaúba)/)) {
    return "Oleaginosas";
  }
  
  if (n.match(/(óleo|azeite|gordura)/)) {
    return "Gorduras";
  }
  
  if (n.match(/(biscoito|bolacha|bolo|bebida|refrigerante|cerveja|chá|café|cachaça|aguardente|caldo|isotônica|água)/)) {
    return "Bebidas";
  }
  
  if (n.match(/(salada|quibe|quibebe|vatapá|tacacá|yakisoba|virado|sarapatel|salpicão|tabule|acarajé|arroz carreteiro|baião|barreado|bife|bolinho|camarão|charuto|cuxá|dobradinha|estrogonofe|feijão tropeiro|feijoada|frango com açafrão|macarrão molho|maniçoba|vaca atolada)/)) {
    return "Preparações";
  }
  
  if (n.match(/(doce|mel|rapadura|paçoca|quindim|mousse|pé-de-moleque|achocolatado|açúcar|chocolate|cocada|geléia|glicose|maria mole|marmelada|melado)/)) {
    return "Doces";
  }
  
  if (n.match(/(sal|shoyu|tempero|azeitona|maionese|fermento|gelatina|capuccino)/)) {
    return "Condimentos";
  }
  
  return "Outros";
}

// Função para determinar allowedMeals
function getDefaultAllowedMeals(category) {
  if (category === "Frutas") return ["cafe-manha", "lanche"];
  if (["Proteínas", "Leguminosas", "Carboidratos"].includes(category)) return ["almoco", "jantar"];
  if (category === "Laticínios") return ["cafe-manha", "lanche"];
  return ["cafe-manha", "almoco", "lanche", "jantar"];
}

// Função para converter valores "NA", "Tr", "*" para números
function parseValue(value) {
  if (!value || value === "NA" || value === "Tr" || value === "*" || value.trim() === "") {
    return undefined;
  }
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

// Processar CSV
const lines = csvData.split('\n');
const headers = lines[0].split(',').map(h => h.trim());
const foods = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV considerando que pode ter vírgulas no nome
  const parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  
  if (parts.length < 6) continue;
  
  const id = parts[0];
  const name = parts[1];
  const calories = parseValue(parts[2]);
  const protein = parseValue(parts[3]);
  const fat = parseValue(parts[4]);
  const carbs = parseValue(parts[5]);
  const fiber = parts[6] ? parseValue(parts[6]) : undefined;
  
  // Tratar valores especiais
  // Para óleos e gorduras puras, usar valores padrão quando NA
  const isOil = name.toLowerCase().match(/(óleo|azeite|manteiga|margarina)/);
  const isSugar = name.toLowerCase().match(/(açúcar|açucar)/);
  const isSalt = name.toLowerCase().match(/(sal)/);
  
  // Valores padrão para casos especiais
  let finalCalories = calories;
  let finalProtein = protein !== undefined ? protein : (isOil || isSugar || isSalt ? 0 : undefined);
  let finalFat = fat !== undefined ? fat : (isOil ? 100 : undefined);
  let finalCarbs = carbs !== undefined ? carbs : (isSugar ? 100 : undefined);
  
  // Para óleos: 884 kcal, 0 protein, 100 fat, 0 carbs
  if (isOil && calories === undefined) {
    finalCalories = 884;
    finalProtein = 0;
    finalFat = 100;
    finalCarbs = 0;
  }
  
  // Para açúcares: ~387 kcal, 0 protein, 0 fat, ~100 carbs
  if (isSugar && calories === undefined) {
    finalCalories = 387;
    finalProtein = 0;
    finalFat = 0;
    finalCarbs = 99.5;
  }
  
  // Para sal: valores muito baixos ou zero
  if (isSalt && calories === undefined) {
    finalCalories = 0;
    finalProtein = 0;
    finalFat = 0;
    finalCarbs = 0;
  }
  
  // Tratar "Tr" (traços) como 0
  if (finalProtein === undefined) finalProtein = 0;
  if (finalFat === undefined && !isOil) finalFat = 0;
  if (finalCarbs === undefined && !isSugar) finalCarbs = 0;
  
  // Pular apenas se não tiver calorias (obrigatório)
  if (finalCalories === undefined) {
    console.warn(`⚠️  Pulando "${name}" - sem valor de calorias`);
    continue;
  }
  
  const category = categorizeFood(name);
  const isUnit = name.toLowerCase().includes('ovo');
  
  // Construir objeto sem campos undefined (Firestore não aceita undefined)
  const foodObj = {
    name: name,
    category: category,
    calories: finalCalories,
    protein: finalProtein,
    carbs: finalCarbs,
    fat: finalFat,
    unit: isUnit ? "unidades" : "gramas",
    allowedMeals: getDefaultAllowedMeals(category)
  };
  
  // Adicionar campos opcionais apenas se tiverem valor
  if (fiber !== undefined) {
    foodObj.fiber = fiber;
  }
  
  if (isUnit) {
    foodObj.unitWeight = 50;
  }
  
  foods.push(foodObj);
}

const output = {
  description: "Dados completos de alimentos da TACO com valores nutricionais",
  version: "1.0.0",
  source: "NEPA/UNICAMP - TACO 4ª edição revisada e ampliada, 2011",
  totalFoods: foods.length,
  foods: foods
};

const outputPath = path.join(__dirname, '../src/data/taco-foods-complete.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ Arquivo JSON criado: ${outputPath}`);
console.log(`📊 Total de alimentos processados: ${foods.length}`);
console.log(`\n💡 Agora você pode importar este arquivo usando a página "Importar TACO" no sistema!`);


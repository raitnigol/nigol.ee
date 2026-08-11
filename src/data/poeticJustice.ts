export type PoeticWorkKind = "poem" | "rap";

export type PoeticWorkLanguage = "en" | "et";

export type PoeticWork = {
	id: string;
	title: string;
	kind: PoeticWorkKind;
	language: PoeticWorkLanguage;
	year: number | null;
	body: string;
	blurb: string;
};

/** Poems and rap lyrics shared under CC BY 4.0. */
export const poeticJusticeWorks: PoeticWork[] = [
	{
		id: "untitled-1",
		title: "Untitled 1",
		kind: "rap",
		language: "et",
		year: 2026,
		blurb: "kus mu pale on / miks see vale on — Anneliinna ja mujalt.",
		body: `kus mu pale on / miks see vale on / kus türa tanel on / tema minust vanem on / lemmikhobi padel on / tibu nii sale on / korteris mul klaver on

fedex / kredex / reedeks / pedeks / leebeks / peeneks / meeneks / teeneks / seeneks / veeneks

halloweenil tattidele jagan mina komme
sellest väljasündinud on mul komme
klaasikilde, nõelu ja muud sodi
panen kommi sisse enne kui jagan laiali ma sodi
mõni ütleb paha see, seda teha ei tohi
olin enne vaimselt terve, nüüd ma olen terve
see halloweeniteraapia on nagu imerohi

terve crew on täis tonte (bensiin), nad on tobedad
saan jalad alla nagu vanad ja kobebad

semu, palun lõpeta see trall või lõpetad sa kabelis
sul on kehas rohkem aineid kui on mendelejevi tabelis

elan mustamäel, mind otsitakse taga
telefon on katki, ei saa kutsuda lesterit, sest see värdjas magab
oleks võinud küsida dokki kui sel vennal pakkusin ma testerit
nüüd 5 tärni, mul tuleb varjuda, mu libu hakkas karjuma, ta ei suuda ära harjuda, et tänasest elame me harjumaal
a mis kuradima harjumaa, mu kodulinn on tallinn, seda ma ei salli, sest siin elad sibulatega nagu faking tallis

raja 4D, verine mun veen, kehas on see seen, mida türa teen
mustamäelt paideni, ja sealt otse tartu
musta mehe, trumpi, ja siis bideni, tekkida võib kartus
äkki tekib korruptsioon ja võim on üle antud
nagu revolut, pangast ülekanne panka, võim on üle kantud
mina tipu poole liikumas aga sina oled põhja lasknud ankru
pole palju vaja tõestada et tallinn pasaauk ja õige elukoht on tartu
jõudsin kodulinna, lõpp-peatus, mõisavahe poole olen teel
see seen mida sõin on ikka minu sooles sees

pakud mulle mõtteainet tuleb seda kaaluda (kellata)
harjumnaalt tartusse, asjad võiks nüüd laabuda
näed välja sama putsis nagu klaabu sa (kellap ???)


nagu cheddar, neid riime ma riivin
tulin asju ajama, vaha teha paar diili

semu oli nagu raha vaja aga tööd teha pole motti
ma andsin talle kätte gripkotid
ja me ei lükka üksikuid, miinimumiks sotid
see plaan on väga safe, päris tipp-topp nii

putsis, maksuamet turjal, keda see küll kotib
pohhui, ei hakka huiama ja ajan selgeks sotid
kukepoiss mu pangakontot vaatleb
türa milles nuss, me ei lükka gedosid vaid plaate
kas te aru saate, toimub esimene vaade


aus mees, ärimees, gustav müürimägi
silmad sitaks punnis kui ta essat korda lürri nägi
selle venna tapmiseks on vaja mehi palju, terve sõjavägi
skeemid on nii kompleksed et nendest ei näe me läbi
tegelt gustav on humble vend, ta ei ole needy
andke talle speedi, ketamiini, ja natukene weedi
ta teeb selle liini, vaja pole palju
spido teeb ta kiireks ja käbi najal teeb ta nalju
võta ainult pool mahvi, see on tartu parim valju
ma ei mähi, olen kindel nagu kalju (kliffrock)

lugu päris kole
terve elu olen grindinud aga keefi ikka pole
süües kasvab isu ja tarvitades kasvab tole
elu pole värviline, elu pole tore
pakud mulle mõtteainet, tuleb seda kaaluda
oota natukene kuni asjad laabuvad
ootan veidi kuni semud saabuvad

hambad sul on putsis, siin on pudel - see on listerine (listeriin!)
tap in lits, ole valmis - listen in
anna mulle kinnitust et siiamaani kuulad ja oled listening
vaatasin su onlyfansi, miks su vitu peal on blisterid?
varsti neelad alla türa, nagu imeksid sa twisterit
mõistust sama vähe antud nagu minu semul, kellel nimi mr. bean
sa sündisid suguvõsa kokkutulekul kui ära oli joodud pudel, viin

lugu läheb põnevaks
kas sulle meeldib minu riime lugeda?
pane delete, kustuta oma pildid sest need on rõvedad
seda arvan mina, aga peaks me mõlemad
sina ja su sõbranna olete nii tõredad
süütan leegi, panen põlema teid mõlemad
hambad niigi putsis, sa ei suuda normaalselt kõnelda
olen aus, keegi pidi seda kõnelma
arvasin et oled ainus aborigeen oma peres, aga türa sul on õde ka

mnida vittu sa mähid, exceldad
ma olen unikaalne, ainulaadne eksemplar

ained, need on vaheldus, need ei ole lahendus
selles ilmselt mitu korda kaheldud
aga tahaks ikka katsetada - vahel ju?
oled lambi jorss, sa pole tahetud

seis on räpane, vaata kuhu jumal juhatas su
sind on vaja ära koristada, puhastus suur
vaja koristada kiirelt, vaja koristada viledalt
võtan kätte mopi, usaldatud vileda
su naine teab kuidas mekin, andsin talle mekkida ja lõhkusin ta kile ka

enne olin silver (AG (Orissaar)) aga nüüd ma olen global. Higistasin tippu jõudmiseks saunas täpselt nagu Toobal.

Käitud nagu gängster, räägid tänavate elust
sellest betoonlinna värvilisest elust
näed välja nagu hulk, kael roheline, ketid on sul temust

Mõned inimesed oskavad oma elust sinu ellu piina tuua
selle lahenduseks on tavaliselt mõistlik viina juua

Elad olevikus, muuta saad sa tulevikku, sa ei saa muuta minevikku
Palun ola hea ja mine vittu

Sa räpid kuidas koguaeg smoged, mees su laed on kolme meetrised
Isa ei jõudnud su sünnile, pidi minema otse eetrisse
Ema mõtleb millist korterit osta Tallinnasse, peetrisse

Ta on nii kena, et ta meeldib mulle ilma meigita
Ei vaevunud ma ostma talle kleiti ka
Ta on ime ja, aga talle meeldib veipida

Kõige alustala / ma ei tea kust alustada
Mõni meist on sõltlane / mõni meist on võlglane

Kui on alles algus ja kõik alles ärkab
Kui on algus ja kõik alles kasvab
Kes on võtnud aega et lilled ära kasta

Racked up 3 W's in a row, call it World Wide Web?
Päeval olen hitimees, aga õhtul olen hitimees
5 G / Viis gee (gedo) / niiske / nii teeb viis teed ristee vistleb?

Vaata ennast peremeest, inspekteeri peeglit
Putru söövad kõik aga nõusid ei pese keegi
Kõik sitt maha nagu mängiks keeglit
Olen see vend kes leiutab reeglit

Türa, kuula mees
Ma olen aadlik, sa oled sulane
Räägi, kas oled sibul või lihtsalt punane

traphouse põles maha sest et jonu kukkus maha
põles ära mitukkümmend tuhat raha
aga see on suht pohhui selle maja mängisin ma kasiinos maha

sõidan tänaval, vaatan ette ma
ühe pisikese, järsu hetkega
oleks selle venna elu lõppenud autoretkega


sellepärast on mu autol mooditud istmed
ületan kahesajaga ma ristteed
kõrvalistmelt küsida türa mis teed
vastan sulle et otseteed, siit saab otse mees


piirusekiirang ja paragrahv ka
see on riigi väljamõeldud propagandaa

nagu hunt lambanahas paks on mu kasukas
võtan riigi üle mitte ühegi lasuta
mõni ütleks et see oleks nagu tasuta
ütlen meediale et sellest homod te ei pasunda

maksud on nii kõrged ja palgad on nii madalad
viin maksab palju ja tobi maksab nagu oleks madalmaal
puudub balanss, puudub riigil tasakaal
nagu dalmaatsia koer kõik täis pasandab
ja kui julged olla vastu öeldakse "ole tasa sa"
sa ei ütle midagi ja endamisi arutad et "ära kamanda"
kui jõuludel me oleks ühes lauas saaksin mina liha sina aga kamara
kui kaua kaniitame enne kui see tavaks saab
läheme mina sina duelli peame vabakal
kummal enne matšeete kõhtu see vabaks saab


miks elada maapeal, põrgus, kui saab minna paradiisi, taevasse
miks on see tabu, et
kõik mis su lahkumiseks vaja on nöör ja taburet
kõhna või paksu, ronime me tasku, köie pealt ei maksa käibemaksu
pilt hakkab eest kaduma ja kaelaluu teeb raksu
pean lahkuma siit ilmast, maksku mis maksab

liitusin tallinna serveriga, kõik oli nonnereid täis
polnud väga viga, vähemalt elu käis
läksin laulsin soomlastega karaoket ja jõin end täis


ärkasin balti jaama spawnis, inventuur tühi
aga ikka õnnest suud puhtaks ma ei pühi

Siin ilmas on keegi kes peab sind oma lemmikuks
Sinu armastus tema vastu igaveseks tellitud
Ära söö saia ja sepikut,
siis pole vaja süstida ozempicut
Söö lihtsalt kana ja riisi, see tuleb epic cut

Tooge mulle näole see värdjas faking vitt,
kes arvas et on okei kui ainult neile on loetav
Nähtamatu tindiga kirjutatud skript

Mängi kaartidega, oma riistaga või pokkerit
Võimalus on kohata seda sitast faking jokkerit
Otseülekanne bongacamsi visake paar tokenit

loobin süstlaid need on kama nooled
popin pille tramadole
kolm kilo kokaiini on mul sooles


sa tiksud kodus netflixi nagu hammasratas elad orjana
on aeg hakata tänavaid puhastama ma käin tänavalt süstlaid korjamas

To the pretty one
Kas asi on minus, või on mul vale arusaam?
Kummal meist küll võiks olla valusam?
Andeks vigade eest olen andeks palun"d ma
Nagu hõljuks kosmoses, kaotanud ennast ja kadun'd maa
Pole kiiret, aega on tarvis varuda

Sa läksid ja tulid, kibekiiresti
Pluss ja miinus, saatus, meid kokku liideti
Haavad on veel värsked, nagu muru mida äsja niideti
Sa võid olla suurepärane ja liiderlik
Kõigi ees sind taevani kiideti

Seljast kaob särk, rinnahoidja ja teised riidetki
Sa oled laitmatu, võrratu, sind taevani kiideti

kui on vaja räppida siis ma räpin kiirelt, nagu välk selgest taevast sinu eide tegin tiineks
mina olen salaami ja sina pereviiner
mina olen pealik ja sina oled piider
ma rohkem õllevend ja sulle meeldib siider
rajoonis käivad lasud pane pähe omal kiiver
kutsuge mind ahjuks sest mul on faking siiber


neljandast klassist saadik pole käinud koolis
karm reaalsus on siis kui elad rajoonis
ma võin jätkata täpselt samas toonis

sul hakkab kohe vahe aeg, käed saavad veriseks ja vaja läheb kinnast
selleks on nüüd vale aeg, sest rajoon on annelinnas


sõpradega saunas ja türa on sul vinnas

08 siin seltskonnas hinnas

sul on muidu kole tibi a tal kenad rinnad

ei saa nii käia lõpmata
et ravimid on võtmata
ma pole nagu bena et lähen sõtta ma

ma rahulik vend ma tiksun annelinnas
vasak käsi parem käsi käes on mul kinnas
ma olen kaine ma sitta ei tõmba ninna
sul on huvitav persoon a mind huvitavad su rinnad na
nagu ninja ma


kui olen väsinud ja mul ei tule und
siis mõtlen sellest kuidas suvel lükkan lund

türa kui pikk on see faking koridor
sa oled punane, faking pamidor
verest tühjaks lasen sul joosta
mis sa selle peale kostad
nii juhtub kui valelt vennalt fentanüüli ostad

sõbrad kutsuvad mind jooma
pole aega kätte võtta asun asju looma

retseptiravimid on otsas
neid ei saa enam käsimüügist osta
mis sa selle peale kostad

mitu püssilasku sul särgis väljas niidid
värinad ja võõrutusnähud sooritan ma massigenotsiidi

kas mehel on pere või perel on mees
no tere mees
vastust sellele ei tea isegi pere mees

sa võid mind ikka tänada
a sulle meeldib hämada
tõmbad ninna sitta hämaras

sul pole motti ega, oled korvpallur
mängid pallidega, kottidega

käi putsi legendaarne records
käi putsi genka, see on legendaarne rekord

jah, ma panin riimuma rekordi rekordiga, oh hui
uus rekord, iga, lugu mis välja ma lasen
uus level, uus tase - see on rahast pohhu¥

suur papa või mitte, ta ei kanna mu titte.
see on sport mängime me hokit mina olen pealik ja sina oled litter
see pede nagu lidlis et raha tahab säästa,
vaja teha tegusid et eesti hip hop päästa

kuigi ma muusikast hoolin, pole käinud muusikakoolis
toon teile tagurpidi tabureti, neljasõbra tooli

õues on sitt ilm. kuradi vittsilm

annelinnast veidi lähemalt
minu kodu asub siin samas lähedal

annelinnas elada on üpriski ohtlik
korra jalutad sa õues ja juba vajad tohtrit

kui ma välja lähen kannan kaasas kohvrit, snaipriga
mingi purjus venelane otsib uut ohvrit, kaifi ka
kaifi ka
türa muidu norm vend tiksub laifi ta

aga see sibul ei oska hinnata
et müün talle fenta plaastreid poole hinnaga

selle taktikaga üritan ma teda murda
ma ootan väga selle sibula surma
et keegi selle pässi mataks nüüd mulda
jonu läheb suhu annan sellel tuld ma

türa ma tegin nalja ei propageeri aineid
meie ühiskonnas vaja inimesi kaineid

kes sittudes kuseb
see nikkudes sureb

nad ei mõtle sirgelt


türa
nagu timo topsi pissin ma jaja
mul ei ole sneak dissida vaja
käi putsi ragnar

ma olen nagu kendrick ja sa oled nagu drake
ma olen naftasheik ja sina oled feik
nagu türgist toodud gucci
ole hea ja palun käi sa putsi
soeng on õline palun kanna kapuutsi


türa aja oma liini sa
a tead et õhku nikotiiniga


sa ise tead mis tee omal rajad
ise teed mis tahad ise tead mis paha


mu munn on nagu see suur kali
5 kopikat


polnud sind raske teolt tabada
keniga see kaal oli vaja klabada

käi putsi tomi
ööst on saanud hommik

too tagasi meie kaal
või muidu, savi.... saaar
türa ma varastan ära su ratta
kas sa siis tegutsema hakkad
ma ei ähvarda sind vägivallaga
putsi varsti kõnnid jala sa


too tagasi kaal too tagasi kaal

sa müüd sitta kanti sitta manti
oma pleissi andsid panti


kivi peal ja kaha all
ämblikud mul naha all

skisoda mul pole mahti
elektroonikat ma kisun lahti

veenid on mul villis
ja suured on mul pupillid
aga põhjus on teine
pole ära villind

pudeleid ma mämmiga
tatte growis skämmin ma

see sitt on nii toores
see sitt on sul sooles

sa oled nagu drake
su tüdrukud nii noored

tõstan ümber toole
sa pöörad teise poole

õpetan sind nüüd nagu oled koolis
taburet on tagurpidi neljasõbra tooliks
keegi meist ei hooli
ratsutad sa tooli
kaua teha ei saa
minema peab kooli

kas vajad kutset sa
et minna kutseka

nimona
ma kusen pudelisse mängin see on limonaad

Annelinnas sündinud olen huligaan
Taskus mitu glocki elu on huvitav

Mõisavahe 59 seal ma suvitan
Keni juures võin sinu riista mudida

tegemata load, maal korjamata oad
bayonetid karambitid taskus on mul noad

need kuradima sitased vene föderastid
need sitased faking haisvad pederastid

need sibulad panen kuutu ma
türa tahaks kakelda puutiniga

ühe sibulaga läksin shuuti ma

tahan oma püstoliga teid shootida

elu polegi nii sitt ega ju kasin
kui saad maha lasta venelasi


tapan ära annelinna venelased
türa see on level up järgmine tase

glockiga või mitte mul ei ole vahet

närvi ajanud mind on nad suvest saadik
varastasin ära ühe venna paadi
ühe pederasti korterisse panin naadi

ühe vene libu koer palju haukus
a see lõppes kohe kui ma kuulsin pauku

türa tõmban välja rpg

olen tõeline eesti mees

growtopia
sa oled minu koopia
sul on vana nokia`
	}
];

export const listedPoeticWorks = poeticJusticeWorks;

export function findPoeticWork(id: string): PoeticWork | undefined {
	return poeticJusticeWorks.find(work => work.id === id);
}

export function isPoeticWorkId(id: string): boolean {
	return poeticJusticeWorks.some(work => work.id === id);
}

export function poeticWorkHref(id: string): string {
	return `/poetic-justice/${id}`;
}

export function formatPoeticKind(kind: PoeticWorkKind): string {
	return kind === "poem" ? "Poem" : "Rap";
}

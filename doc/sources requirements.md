[S0] Context confidence: High

Có thể làm theo hướng “public interview research → behavioral patterns → proto-persona → business requirements”, nhưng **không phải tất cả source t cite trước đó đều đủ chất lượng để đứng ngang hàng nhau**. Sau khi audit lại method và provenance, t sẽ bỏ khá nhiều source khỏi research backbone.

Điểm quan trọng nhất:

> **Public UX personas không phải evidence mạnh nhất. Public interview/field studies mới là evidence. Persona chỉ là artifact được derive từ evidence đó.**

Nếu làm ngược lại, lấy persona của designer khác rồi sửa tên, thì user-centric biến thành cosplay research.

## [S1] Tiêu chuẩn t dùng để đánh giá source

T đánh giá mỗi source theo 5 thứ:

**Provenance** = ai làm và publish ở đâu. Peer-reviewed research > university research > funded field project > self-published UX portfolio.

**Method transparency** = có nói rõ sample, recruitment, interview protocol, duration, analysis method hay không.

**Ecological validity** = user có thực sự dùng system trong đời sống không, hay chỉ trả lời một vài câu trong Zoom.

**Problem relevance** = có trực tiếp nghiên cứu inventory / perishability / expiry / household food management không.

**Transferability** = finding có thể dùng để hypothesis cho app của mình tới mức nào, xét khác biệt quốc gia, tuổi, household structure.

Từ đó t sẽ dùng bốn mức:

`A = Backbone evidence`  
`B = Supporting evidence`  
`C = UX precedent / hypothesis generator`  
`D = Không dùng để support claim`

---

# [S2] Audit lại từng nguồn

|Source|Method thực tế|Strength|Weakness|T sẽ dùng thế nào|Grade|
|---|---|---|---|---|---|
|**TotalCtrl – JMIR**|6 students, mixed-method, semistructured pre/post interviews, mỗi app dùng 1 tháng, có đo waste/cost|Peer-reviewed; user thật dùng app thật đủ lâu để friction xuất hiện|n=6, toàn sinh viên Norway|Evidence rất mạnh cho **manual-entry burden, stale inventory, barcode frustration, awareness**|**A**|
|**CozZo / LOWINFOOD**|52 households, Austria/Finland/Greece, field use 3–6 tuần, interview + questionnaire + food-waste audit|Sample household lớn nhất trong nhóm app studies; real-life deployment|Conference proceeding, không phải full journal paper; không nên suy causal mạnh từ “43% reduction”|Strong support cho **work required, expiry estimation, stock visibility, planning**|**A-**|
|**Taiwan qualitative study**|27 household food providers, ~90-min recorded interviews, transcripts, 2 coders, reliability >.80, triangulation|Method rất rõ, peer-reviewed, qualitative khá nghiêm túc|Không test app; sample thiên nữ 30–50, Taipei|Backbone cho **underlying needs/barriers**, nhất là edibility knowledge, planning, family preferences|**A**|
|**Graham-Rowe et al.**|15 UK household food purchasers, semi-structured interviews, qualitative thematic categories|Peer-reviewed; focus trực tiếp motivation/barriers|UK 2014, không app-specific|Backbone cho **inconvenience, lack of priority, food-management skill**|**A-**|
|**EATiT! TU Eindhoven**|7 young adults, 2 shared households, prototype deployed 10 days|Real environment + interaction research|n rất nhỏ, 6/7 male students, chỉ 10 ngày; chính paper thừa nhận sample/time hạn chế|Support concept **visibility / peripheral awareness**, không dùng để generalize persona|**B**|
|**SensiFi**|survey + 8 interviews + onsite observation + affinity map + 8 think-aloud tests|Process UX tương đối đầy đủ; có behavioral archetypes|Self-published portfolio, recruitment/raw coding không đủ để audit độc lập|Dùng để tham khảo **persona framework + UX testing**, không dùng làm factual backbone|**C+**|
|**FreshTrack**|6 Zoom interviews + tree test 10 users|Gần đúng product problem|Portfolio; sample nhỏ; analysis/recruitment chưa đủ transparent|Cross-check recurring needs|**C**|
|**NoWaste redesign**|5 interviews + persona|Pain points khớp nhiều source khác|Portfolio cá nhân, n=5, không đủ methodological detail|Persona/design precedent|**C**|
|**Dapurbit**|in-depth interviews, affinity mapping, persona|Finding rất thú vị vì initial assumption bị interview bác bỏ|Không disclose rõ n; fictional learning project|Dùng như **counter-example / hypothesis challenge**, không làm proof|**C**|
|**FridgeBuddy**|interview-style primary research + personas|Product rất gần app|Participant count/method không đủ rõ trong public artifact|Inspiration thôi|**C-/D**|

Nguồn **WasteZero Medium case study** trước đó t sẽ bỏ khỏi backbone hoàn toàn. Không cần nhồi thêm một nguồn yếu khi đã có research tốt hơn.

---

# [S3] Nguồn mạnh nhất hiện tại

Nếu báo cáo chỉ được dùng khoảng 4–5 nguồn core, t sẽ chọn:

### 1. TotalCtrl

Đây là source **gần product của mình nhất**.

Paper là JMIR Formative Research, dùng mixed methods. Sáu participants dùng hai apps riêng biệt, mỗi app một tháng; expectations và experiences được lấy bằng semi-structured interviews. [JMIR Formative Research](https://formative.jmir.org/2022/9/e38520/)

Quan trọng hơn, họ ghi được đúng failure mechanism mình quan tâm:

- barcode không recognize → user phải manual entry;
- phải nhập expiry riêng;
- ăn xong lại phải update inventory;
- users cảm thấy một thứ lẽ ra đơn giản trở thành quá nhiều work. [JMIR Formative Research](https://formative.jmir.org/2022/9/e38520/?utm_source=chatgpt.com)

Đây support rất tốt cho requirement:

```
Minimise recurring inventory-maintenance effort.
```

Nhưng không support:

```
90% users hate manual inventory
```

Vì n=6.

Tức là nó chứng minh **mechanism tồn tại**, không chứng minh prevalence trong population.

[TotalCtrl study — JMIR Formative Research](https://formative.jmir.org/2022/9/e38520/?utm_source=chatgpt.com)

---

# [S4] CozZo thậm chí có giá trị product hơn t nghĩ lúc đầu

52 households dùng kitchen-management app trong đời thật **3–6 tuần**, ở Austria, Finland và Greece. Research còn thực hiện food-waste audit trước và cuối intervention, rồi thu experiences bằng interview và online questionnaires. [Zenodo](https://zenodo.org/records/14164532)

Các challenge được report gồm:

```
work required from users
expiry estimation
perceived added value
```

Trong khi positive effects gồm:

````
awareness of stock
awareness of expiring items
purchase planning
ideas for surplus/leftovers
``` :chatgpt-content-reference{index="4"}


Đây là evidence trực tiếp cho trade-off trung tâm của app:

\[
ValueOfTracking > CostOfMaintainingTracking
\]

Nếu inequality này đảo:

\[
MaintenanceCost > PerceivedValue
\]

thì user bỏ system.

Đó là system mechanism rất đáng đưa vào BR.

Nhưng con số **43% waste reduction** của proceeding này t sẽ không lấy làm target KPI cho app mình. Nó là intervention result đáng chú ý, nhưng không đủ để mình nhảy sang “app của chúng ta sẽ giảm 40%”. :chatgpt-content-reference{index="5"}

[CozZo household field study](https://zenodo.org/records/14164532?utm_source=chatgpt.com)

---

# [S5] Source interview mạnh nhất để hiểu “user”, không phải “app”

T sẽ thêm một source mà response trước chưa ưu tiên đúng mức: nghiên cứu tại Taiwan.

Họ interview **27 household food providers tại Taipei**, mỗi interview trung bình khoảng **90 phút**, record và transcribe verbatim; sau đó content analysis, hai coders, reliability >0.80 và triangulation. Đây là methodology khá nghiêm túc cho qualitative research. :chatgpt-content-reference{index="7"}

Kết quả quan trọng gồm:

- khó đánh giá food còn edible không;
- planned purchasing;
- knowledge để giữ food fresh;
- family preferences;
- leftover management;
- sharing surplus. :chatgpt-content-reference{index="8"}

Đây không chứng minh UI nào nên có.

Nó làm việc quan trọng hơn:

> Nó giúp định nghĩa **problem space trước solution**.

Và về cultural transferability, Taiwan vẫn không phải Vietnam, nhưng household-food context gần khu vực của mình hơn một UX student portfolio ở Mỹ.

[Taiwan qualitative household food-waste study](https://pmc.ncbi.nlm.nih.gov/articles/PMC8535035/?utm_source=chatgpt.com)

---

# [S6] Graham-Rowe cũng rất đáng giữ

15 household food purchasers ở UK được semi-structured interview. Study xác định các barriers gồm:

- minimising inconvenience;
- lack of priority;
- competing responsibility;
- food-management capability. :chatgpt-content-reference{index="10"}

Đây cực kỳ ăn với TotalCtrl:

```text
Academic behavioural research:
"Inconvenience / lack of priority matters"

+

Actual app field study:
"Manual inventory became too much work"

             ↓

Cross-source mechanism:
Tracking friction competes with everyday priorities.
````

Đây là **triangulation**.

Một source nói user không thích nhập liệu chưa mạnh.

Hai loại research độc lập cùng chỉ về một mechanism thì mạnh hơn nhiều.

[Graham-Rowe et al. qualitative study](https://sussex.figshare.com/articles/journal_contribution/Identifying_motivations_and_barriers_to_minimising_household_food_waste/23401370?utm_source=chatgpt.com)

---

# [S7] EATiT có dùng được không?

Có, nhưng phải hạ vai trò.

Study chỉ có:

`7 young adults`  
`19–26 years`  
`2 shared households`  
`10 days`  
`6/7 male`  
`all students`.

Chính tác giả cũng ghi deployment 10 ngày quá ngắn và sample cần lớn hơn để diễn giải mạnh hơn. [ResearchGate](https://www.researchgate.net/publication/319628588_EATiT_Visualizing_expiry_dates_to_raise_awareness_of_food_waste)

Nhưng source này đặc biệt hữu ích cho một specific insight:

> `food availability + perishability can fall outside active attention`.

Study report shared-household problems như unpredictable busy lifestyle, không biết trong fridge có gì và đồ thuộc về ai. [ResearchGate](https://www.researchgate.net/publication/319628588_EATiT_Visualizing_expiry_dates_to_raise_awareness_of_food_waste)

Vậy:

**Được dùng:**

```
Visibility is one plausible mechanism behind forgotten food.
```

**Không được dùng:**

```
Young users generally need ambient expiry visualization.
```

Độ generalization khác nhau hoàn toàn.

---

# [S8] Còn mấy persona public thì sao?

Đây là chỗ cần refine mạnh nhất so với câu trả lời trước.

## SensiFi

SensiFi thực sự làm khá tử tế về UX process: survey, 8 interviews, on-site observation, affinity mapping, persona taxonomy và sau đó 8-user think-aloud study. [Mansi Kasar](https://www.mansikasar.com/sensifi)

Họ phân user theo:

```
awareness
×
taking action
```

rồi tạo archetypes Hero / Supporting Role / Body Double / Villain. [Mansi Kasar](https://www.mansikasar.com/sensifi)

Ý tưởng này **rất đáng tham khảo cho cách segment**.

Nhưng t sẽ không viết:

> Research proves users consist of four types.

Vì đây là portfolio artifact, không phải validated behavioral taxonomy.

T sẽ viết:

> SensiFi demonstrates one published UX approach to constructing behavioral archetypes from awareness and action dimensions.

Khác nhau ở chữ “demonstrates”, không phải “proves”.

---

## NoWaste / FreshTrack

NoWaste public case study ghi 5 interviews và derive persona; FreshTrack ghi rõ 6 Zoom interviews và tree-test với 10 users. [Ming Jung Kuo](https://www.mingjungkuo.com/nowaste?utm_source=chatgpt.com)

Đủ để:

- xem recurring theme có lặp lại không;
- tìm UX requirement candidates;
- benchmark interview questions;
- xem người khác derive persona như thế nào.

Không đủ để:

- support population claim;
- dùng persona Amy như persona user của mình;
- claim statistically representative.

---

## Dapurbit

Dapurbit có một finding rất giá trị về **reasoning**, nhưng source quality thấp hơn.

Designer công khai nói initial assumption là users cần fridge inventory tracker; interviews khiến họ nhận ra users không hứng thú với concept đó và pain lớn hơn nằm ở meal planning. [Fathia Anindya](https://fathia-anindya.com/DAPURBIT-CASE-STUDY.html)

Đây là một **falsification case** rất hay.

T dùng nó để hỏi:

> “Chúng ta có đang mắc đúng assumption đó không?”

Không dùng nó để kết luận:

> “Users không muốn inventory tracker.”

Vì source không disclose rõ sample size.

---

# [S9] Vậy cách làm khả thi nhất là gì?

Khả thi, với architecture research như sau:

#chatgpt-mermaid-_r_1v6_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1v6_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1v6_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1v6_ .error-icon{fill:rgb(27, 27, 27);}#chatgpt-mermaid-_r_1v6_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1v6_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1v6_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1v6_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1v6_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1v6_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1v6_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1v6_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1v6_ p{margin:0;}#chatgpt-mermaid-_r_1v6_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1v6_ .label text,#chatgpt-mermaid-_r_1v6_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ .node rect,#chatgpt-mermaid-_r_1v6_ .node circle,#chatgpt-mermaid-_r_1v6_ .node ellipse,#chatgpt-mermaid-_r_1v6_ .node polygon,#chatgpt-mermaid-_r_1v6_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ .rough-node .label text,#chatgpt-mermaid-_r_1v6_ .node .label text,#chatgpt-mermaid-_r_1v6_ .image-shape .label,#chatgpt-mermaid-_r_1v6_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1v6_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ .rough-node .label,#chatgpt-mermaid-_r_1v6_ .node .label,#chatgpt-mermaid-_r_1v6_ .image-shape .label,#chatgpt-mermaid-_r_1v6_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1v6_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1v6_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1v6_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1v6_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1v6_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1v6_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1v6_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1v6_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1v6_ .cluster rect{fill:rgb(27, 27, 27);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(27, 27, 27);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1v6_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1v6_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1v6_ .icon-shape,#chatgpt-mermaid-_r_1v6_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1v6_ .icon-shape p,#chatgpt-mermaid-_r_1v6_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1v6_ .icon-shape .label rect,#chatgpt-mermaid-_r_1v6_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1v6_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1v6_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1v6_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1v6_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1v6_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1v6_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1v6_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1v6_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1v6_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_1v6_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1v6_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1v6_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ .node rect,#chatgpt-mermaid-_r_1v6_ .node circle,#chatgpt-mermaid-_r_1v6_ .node ellipse,#chatgpt-mermaid-_r_1v6_ .node polygon,#chatgpt-mermaid-_r_1v6_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1v6_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1v6_ .node.mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_1v6_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1v6_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1v6_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Tier A academic / fieldevidenceExtract observed behavioursTier C public UX personasCompare UX interpretationsCross-source evidence matrixRepeated behaviouralmechanismsBehaviour dimensionsLiterature-groundedproto-personasUser needs / JTBDBusiness requirementsLocal validation

Điểm khác response trước là:

```
UX personas
        ↓
KHÔNG tạo evidence

Academic + field evidence
        ↓
tạo behavioral hypotheses

UX personas
        ↓
chỉ cross-check / inspire synthesis
```

---

# [S10] Evidence gate t sẽ dùng

Một finding chỉ được đưa vào persona nếu thỏa ít nhất một trong hai điều kiện:

### Gate 1

Được support bởi **≥2 independent strong sources**.

Ví dụ:

```
Manual maintenance is costly
```

TotalCtrl:

`registration + updates = too much work.` [JMIR Formative Research](https://formative.jmir.org/2022/9/e38520/?utm_source=chatgpt.com)

CozZo:

`work required from users = challenge.` [Zenodo](https://zenodo.org/records/14164532)

Graham-Rowe:

`minimising inconvenience = barrier.` [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0921344913002711?utm_source=chatgpt.com)

=> **High-confidence recurring mechanism.**

---

### Gate 2

Một source direct field study rất mạnh + mechanism specific.

Ví dụ:

```
Barcode automation can fail back into manual-entry burden.
```

TotalCtrl trực tiếp observe đúng interaction này. [JMIR Formative Research](https://formative.jmir.org/2022/9/e38520/?utm_source=chatgpt.com)

=> dùng được như **specific app design risk**.

---

# [S11] Những findings hiện đã đủ mạnh

Sau audit, t thấy có 5 findings đủ để làm backbone:

|Finding|Independent support|Confidence|
|---|---|---|
|Tracking/maintenance effort là barrier|TotalCtrl + CozZo + Graham-Rowe|**High**|
|Food visibility/awareness là problem|EATiT + CozZo + TotalCtrl|**High**|
|Expiry/perishability không phải lúc nào cũng dễ estimate|TotalCtrl + CozZo + Taiwan study|**High**|
|Planning/use decisions quan trọng ngang inventory|Taiwan + Graham-Rowe + FreshTrack, Dapurbit support|**High**|
|One-size-fits-all behavior assumption nguy hiểm|Multiple qualitative studies show different motivations/capabilities/context|**Medium-High**|

Vậy original framing:

> “People forget expiration dates.”

quá hẹp.

Framing có evidence tốt hơn:

> **People lose track of food as it moves through purchasing, storage, planning and consumption, while the effort required to maintain an accurate digital inventory can itself prevent continued use of a tracking system.**

Đây đủ mạnh để làm Problem Statement.

---

# [S12] Persona có thể làm tới mức nào?

T có thể build cho m **3 literature-grounded proto-personas khá defensible**.

Nhưng t sẽ không đặt tên chúng bằng age/job trước.

T sẽ derive từ behavioral axes như:

```
Inventory awareness
LOW ←──────────────→ HIGH

Management effort tolerance
LOW ←──────────────→ HIGH

Planning orientation
REACTIVE ←────────→ PLANNED

Decision confidence
UNCERTAIN ←────────→ CONFIDENT
```

Sau khi clustering mới ra persona.

Ví dụ có thể cuối cùng thành:

```
Passive Reactor
Busy Improviser
Active Household Planner
```

nhưng tên này **chưa được lock**, vì phải code findings trước.

Đây khác hẳn cách t làm deck vừa rồi, lúc đó t nhảy hơi nhanh từ literature sang ba persona. Bản đó dùng được như draft, nhưng chưa đạt evidence rigor mà bây giờ mình đang yêu cầu.

---

# [S13] Khả thi tới đâu nếu không tự interview?

Nếu mục tiêu môn học là:

> “Create evidence-informed personas and business requirements”

thì **khả thi** bằng secondary qualitative synthesis này, miễn report gọi chúng là:

> **literature-grounded proto-personas**

Nếu requirement là:

> “Personas representing our target users”

thì **chưa đủ**.

Cần một validation vòng nhỏ với người dùng Việt Nam.

Không phải để research lại từ zero.

Mà để kiểm tra:

```
Do these mechanisms transfer?
Does anything important differ locally?
Do our three clusters actually appear?
```

Tức là public research làm cho mình khoảng **70–80% discovery work**, còn local interview dùng để validate/adjust chứ không mù mờ đi hỏi lại cả thế giới.

---

# [S14] Recommendation cuối

Bộ source backbone mới nên là:

**Core behavior research:** Taiwan 27 interviews + Graham-Rowe 15 interviews.

**Direct digital-intervention research:** TotalCtrl + CozZo.

**Focused HCI mechanism:** EATiT.

**Persona/design precedent only:** SensiFi.

FreshTrack, NoWaste, Dapurbit để ở **supporting appendix / comparison**.

FridgeBuddy và WasteZero bỏ khỏi core evidence.

Như vậy report không còn kiểu “8 website đều nói giống nhau nên chắc đúng”. Nó trở thành:

```
Peer-reviewed qualitative behavior
+
real-world app trials
+
focused HCI study
+
UX persona precedent
=
traceable proto-persona synthesis
```

Đây là hướng **khả thi và defend được khi giảng viên hỏi “persona này từ đâu ra?”**.
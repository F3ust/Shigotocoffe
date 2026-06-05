export const cafeSeedData = [
  {
    name: { ja: "トランクイル・コーヒー", vi: "Tranquil Coffee" },
    description: {
      ja: "ホアンキエム湖のそばにある静かなカフェ。高速Wi-Fiとゆったりした座席で、リモートワークに最適。",
      vi: "Quán cà phê yên tĩnh bên Hồ Hoàn Kiếm. Wi-Fi tốc độ cao và chỗ ngồi rộng rãi, lý tưởng cho làm việc từ xa.",
    },
    address: {
      ja: "15 ディンティエンホアン通り、ホアンキエム区、ハノイ",
      vi: "15 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
    },
    district: "Hoàn Kiếm",
    openingHours: { open: "07:00", close: "22:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600",
    ],
    menu: [
      { name: "Cà phê sữa đá", price: 35000 },
      { name: "Matcha Latte", price: 55000 },
      { name: "Bánh mì trứng", price: 30000 },
    ],
    hashtags: ["wifi", "quiet", "noTimeLimit"],
    averageRating: 4.5,
    reviewCount: 42,
    location: { type: "Point" as const, coordinates: [105.8544, 21.0285] },
  },
  {
    name: { ja: "ザ・ワークスペース", vi: "The Workspace" },
    description: {
      ja: "コワーキングスタイルのカフェ。各席にコンセント完備、防音エリアあり。日本人利用者多し。",
      vi: "Quán cà phê kiểu coworking. Mỗi chỗ ngồi đều có ổ cắm, khu vực cách âm. Nhiều khách Nhật.",
    },
    address: {
      ja: "8 カウゴー通り、バーディン区、ハノイ",
      vi: "8 Cầu Gỗ, Ba Đình, Hà Nội",
    },
    district: "Ba Đình",
    openingHours: { open: "06:30", close: "23:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600",
    ],
    menu: [
      { name: "Americano", price: 45000 },
      { name: "Cappuccino", price: 50000 },
      { name: "Cheesecake", price: 65000 },
    ],
    hashtags: ["wifi", "outlets", "quiet", "japanese", "noTimeLimit"],
    averageRating: 4.8,
    reviewCount: 87,
    location: { type: "Point" as const, coordinates: [105.8412, 21.0356] },
  },
  {
    name: { ja: "カフェ・フォーン", vi: "Café Phương" },
    description: {
      ja: "ベトナム伝統コーヒーが楽しめるレトロな雰囲気のカフェ。窓際席からは旧市街の風景が見えます。",
      vi: "Quán cà phê phong cách retro với cà phê truyền thống Việt Nam. Ghế cạnh cửa sổ nhìn ra phố cổ.",
    },
    address: {
      ja: "22 ハンブン通り、ホアンキエム区、ハノイ",
      vi: "22 Hàng Bún, Hoàn Kiếm, Hà Nội",
    },
    district: "Hoàn Kiếm",
    openingHours: { open: "08:00", close: "20:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",
    ],
    menu: [
      { name: "Cà phê trứng", price: 40000 },
      { name: "Trà sen", price: 35000 },
      { name: "Bánh flan", price: 25000 },
    ],
    hashtags: ["wifi", "quiet"],
    averageRating: 4.2,
    reviewCount: 28,
    location: { type: "Point" as const, coordinates: [105.849, 21.033] },
  },
  {
    name: { ja: "コンマ・コーヒー", vi: "Comma Coffee" },
    description: {
      ja: "デジタルノマドに人気のモダンカフェ。スタンディングデスクとミーティングルームを完備。",
      vi: "Quán cà phê hiện đại được digital nomad yêu thích. Có bàn đứng và phòng họp.",
    },
    address: {
      ja: "45 グエンチャイ通り、ドンダー区、ハノイ",
      vi: "45 Nguyễn Trãi, Đống Đa, Hà Nội",
    },
    district: "Đống Đa",
    openingHours: { open: "07:00", close: "23:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600",
    ],
    menu: [
      { name: "Cold Brew", price: 55000 },
      { name: "Flat White", price: 50000 },
      { name: "Avocado Toast", price: 75000 },
    ],
    hashtags: ["wifi", "outlets", "noTimeLimit"],
    averageRating: 4.6,
    reviewCount: 63,
    location: { type: "Point" as const, coordinates: [105.8194, 21.0024] },
  },
  {
    name: { ja: "サクラ・カフェ", vi: "Sakura Café" },
    description: {
      ja: "日本風のインテリアと和菓子メニューが特徴。日本語メニューあり、日本人スタッフ在籍。",
      vi: "Quán cà phê phong cách Nhật Bản với nội thất và bánh ngọt kiểu Nhật. Có menu tiếng Nhật, nhân viên người Nhật.",
    },
    address: {
      ja: "12 リエウザイ通り、バーディン区、ハノイ",
      vi: "12 Liễu Giai, Ba Đình, Hà Nội",
    },
    district: "Ba Đình",
    openingHours: { open: "08:00", close: "21:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
    ],
    menu: [
      { name: "抹茶ラテ", price: 60000 },
      { name: "どら焼き", price: 45000 },
      { name: "ほうじ茶", price: 40000 },
    ],
    hashtags: ["wifi", "japanese", "quiet"],
    averageRating: 4.3,
    reviewCount: 35,
    location: { type: "Point" as const, coordinates: [105.8178, 21.0355] },
  },
  {
    name: { ja: "レイクサイド・ブリュー", vi: "Lakeside Brew" },
    description: {
      ja: "タイ湖を一望できるテラス席が人気。週末は混雑するが平日は穴場。",
      vi: "Ghế sân thượng nhìn ra Hồ Tây rất được ưa chuộng. Cuối tuần đông nhưng ngày thường vắng.",
    },
    address: {
      ja: "6 クアンアン通り、タイホー区、ハノイ",
      vi: "6 Quảng An, Tây Hồ, Hà Nội",
    },
    district: "Tây Hồ",
    openingHours: { open: "06:00", close: "22:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600",
    ],
    menu: [
      { name: "Latte", price: 50000 },
      { name: "Smoothie bowl", price: 70000 },
      { name: "Croissant", price: 40000 },
    ],
    hashtags: ["wifi", "outlets"],
    averageRating: 4.0,
    reviewCount: 19,
    location: { type: "Point" as const, coordinates: [105.8267, 21.0605] },
  },
  {
    name: { ja: "フォーカス・ラボ", vi: "Focus Lab" },
    description: {
      ja: "「集中する」をテーマにした作業特化カフェ。ポモドーロタイマー設置、会話禁止エリアあり。",
      vi: "Quán cà phê chuyên dành cho làm việc với chủ đề 'tập trung'. Có đồng hồ Pomodoro, khu vực cấm nói chuyện.",
    },
    address: {
      ja: "33 ファムゴクタック通り、カウザイ区、ハノイ",
      vi: "33 Phạm Ngọc Thạch, Cầu Giấy, Hà Nội",
    },
    district: "Cầu Giấy",
    openingHours: { open: "07:00", close: "00:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
    ],
    menu: [
      { name: "Espresso", price: 35000 },
      { name: "Yerba Mate", price: 45000 },
      { name: "Energy Bar", price: 30000 },
    ],
    hashtags: ["wifi", "outlets", "quiet", "noTimeLimit"],
    averageRating: 4.7,
    reviewCount: 91,
    location: { type: "Point" as const, coordinates: [105.7969, 21.0305] },
  },
  {
    name: { ja: "グリーン・バンブー", vi: "Green Bamboo" },
    description: {
      ja: "竹と緑に囲まれたエコカフェ。オーガニックコーヒーとベジタリアンメニューが充実。",
      vi: "Quán cà phê sinh thái giữa tre xanh. Cà phê hữu cơ và menu chay phong phú.",
    },
    address: {
      ja: "17 ハイバーチュン通り、ハイバーチュン区、ハノイ",
      vi: "17 Hai Bà Trưng, Hai Bà Trưng, Hà Nội",
    },
    district: "Hai Bà Trưng",
    openingHours: { open: "07:30", close: "21:30" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600",
    ],
    menu: [
      { name: "Organic Latte", price: 60000 },
      { name: "Matcha Smoothie", price: 55000 },
      { name: "Vegan Brownie", price: 45000 },
    ],
    hashtags: ["wifi", "quiet"],
    averageRating: 3.9,
    reviewCount: 15,
    location: { type: "Point" as const, coordinates: [105.8563, 21.0114] },
  },
  {
    name: { ja: "ノマド・ハブ", vi: "Nomad Hub" },
    description: {
      ja: "24時間営業のコワーキングカフェ。ロッカー、プリンター、会議室を完備。",
      vi: "Quán cà phê coworking mở 24/7. Có tủ khóa, máy in, phòng họp.",
    },
    address: {
      ja: "50 チャンフー通り、ドンダー区、ハノイ",
      vi: "50 Trần Phú, Đống Đa, Hà Nội",
    },
    district: "Đống Đa",
    openingHours: { open: "00:00", close: "23:59" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1462926703708-44ab9e271d97?w=600",
    ],
    menu: [
      { name: "Drip Coffee", price: 40000 },
      { name: "Chai Latte", price: 50000 },
      { name: "Club Sandwich", price: 80000 },
    ],
    hashtags: ["wifi", "outlets", "noTimeLimit"],
    averageRating: 4.4,
    reviewCount: 56,
    location: { type: "Point" as const, coordinates: [105.8321, 21.0232] },
  },
  {
    name: { ja: "モーニング・グローリー", vi: "Morning Glory" },
    description: {
      ja: "朝活ユーザーに人気。早朝6時から営業し、朝食メニューが充実。屋上テラスからの朝日が人気。",
      vi: "Yêu thích bởi dân thức dậy sớm. Mở cửa từ 6h sáng với menu sáng phong phú. Sân thượng ngắm bình minh.",
    },
    address: {
      ja: "28 ファンディンフン通り、バーディン区、ハノイ",
      vi: "28 Phan Đình Phùng, Ba Đình, Hà Nội",
    },
    district: "Ba Đình",
    openingHours: { open: "06:00", close: "18:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600",
    ],
    menu: [
      { name: "Pour Over", price: 50000 },
      { name: "Açaí Bowl", price: 75000 },
      { name: "Egg Benedict", price: 85000 },
    ],
    hashtags: ["wifi", "outlets", "quiet"],
    averageRating: 4.1,
    reviewCount: 24,
    location: { type: "Point" as const, coordinates: [105.8354, 21.0405] },
  },
  {
    name: { ja: "ザ・リーディング・ルーム", vi: "The Reading Room" },
    description: {
      ja: "本棚に囲まれた図書館風カフェ。私語禁止のサイレントゾーンあり。深い集中を求める人向け。",
      vi: "Quán cà phê kiểu thư viện với kệ sách. Có khu vực im lặng tuyệt đối. Dành cho người cần tập trung cao.",
    },
    address: {
      ja: "9 トンドゥックタン通り、ドンダー区、ハノイ",
      vi: "9 Tôn Đức Thắng, Đống Đa, Hà Nội",
    },
    district: "Đống Đa",
    openingHours: { open: "08:00", close: "22:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600",
    ],
    menu: [
      { name: "Earl Grey", price: 40000 },
      { name: "Tiramisu", price: 55000 },
      { name: "Cà phê đen", price: 30000 },
    ],
    hashtags: ["wifi", "quiet", "noTimeLimit"],
    averageRating: 4.6,
    reviewCount: 47,
    location: { type: "Point" as const, coordinates: [105.8347, 21.0175] },
  },
  {
    name: { ja: "ベトジャパン・カフェ", vi: "VietJapan Café" },
    description: {
      ja: "日越交流をテーマにしたカフェ。日本語・ベトナム語の言語交換イベントを毎週開催。",
      vi: "Quán cà phê với chủ đề giao lưu Nhật-Việt. Tổ chức sự kiện trao đổi ngôn ngữ Nhật-Việt hàng tuần.",
    },
    address: {
      ja: "14 キムマー通り、バーディン区、ハノイ",
      vi: "14 Kim Mã, Ba Đình, Hà Nội",
    },
    district: "Ba Đình",
    openingHours: { open: "08:00", close: "22:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600",
    ],
    menu: [
      { name: "Cà phê sữa", price: 35000 },
      { name: "Sencha", price: 45000 },
      { name: "Mochi", price: 40000 },
    ],
    hashtags: ["wifi", "outlets", "japanese"],
    averageRating: 4.4,
    reviewCount: 38,
    location: { type: "Point" as const, coordinates: [105.8189, 21.0301] },
  },
  {
    name: { ja: "タインスアン・ワークスペース", vi: "Thanh Xuân Workspace" },
    description: {
      ja: "ハノイ西部のノマドワーカーに最適なコワーキングカフェ。静かな環境 và 高速Wi-Fiを完備。",
      vi: "Quán cà phê làm việc lý tưởng cho người làm việc tự do phía Tây Hà Nội. Không gian yên tĩnh và Wi-Fi tốc độ cao.",
    },
    address: {
      ja: "234 グエンチャイ通り、タインスアン区、ハノイ",
      vi: "234 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    },
    district: "Thanh Xuân",
    openingHours: { open: "08:00", close: "22:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
    ],
    menu: [
      { name: "Cà phê sữa đá", price: 35000 },
      { name: "Matcha Latte", price: 50000 },
    ],
    hashtags: ["wifi", "outlets", "quiet"],
    averageRating: 4.5,
    reviewCount: 12,
    location: { type: "Point" as const, coordinates: [105.8019, 20.9982] },
  },
  {
    name: { ja: "ロンビエン・リバーサイド", vi: "Long Biên Riverside Cafe" },
    description: {
      ja: "紅河の景色を望む、広々としたカフェ。静かに本を読んだり仕事をするのに最適です。",
      vi: "Không gian rộng rãi ven sông Hồng. Nơi tuyệt vời để đọc sách hoặc tập trung làm việc yên tĩnh.",
    },
    address: {
      ja: "45 グエンヴァンクー通り、ロンビエン区、ハノイ",
      vi: "45 Nguyễn Văn Cừ, Long Biên, Hà Nội",
    },
    district: "Long Biên",
    openingHours: { open: "07:30", close: "22:30" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600",
    ],
    menu: [
      { name: "Cold Brew", price: 45000 },
      { name: "Croissant", price: 30000 },
    ],
    hashtags: ["wifi", "quiet", "noTimeLimit"],
    averageRating: 4.3,
    reviewCount: 8,
    location: { type: "Point" as const, coordinates: [105.8724, 21.0435] },
  },
  {
    name: { ja: "ハドン・グリーンカフェ", vi: "Hà Đông Green Cafe" },
    description: {
      ja: "緑あふれる静かなカフェ。広い作業デスクと十分な電源が完備されています。",
      vi: "Quán cà phê nhiều cây xanh thoáng mát. Có bàn làm việc rộng và đầy đủ ổ cắm điện.",
    },
    address: {
      ja: "102 トランフー通り、ハドン区、ハノイ",
      vi: "102 Trần Phú, Hà Đông, Hà Nội",
    },
    district: "Hà Đông",
    openingHours: { open: "08:00", close: "22:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
    ],
    menu: [
      { name: "Cà phê đen đá", price: 29000 },
      { name: "Trà đào cam sả", price: 45000 },
    ],
    hashtags: ["wifi", "outlets", "noTimeLimit"],
    averageRating: 4.4,
    reviewCount: 15,
    location: { type: "Point" as const, coordinates: [105.7831, 20.9785] },
  },
  {
    name: { ja: "ナムトゥリエム・テックハブ", vi: "Nam Từ Liêm Tech Hub" },
    description: {
      ja: "モダンな内装のITワーカー向けカフェ。個室風ブースやミーティングスペースもあります。",
      vi: "Thiết kế hiện đại dành cho lập trình viên và người làm việc số. Có các góc làm việc cá nhân và phòng họp.",
    },
    address: {
      ja: "15 ファムフン通り、ナムトゥリエム区、ハノイ",
      vi: "15 Phạm Hùng, Nam Từ Liêm, Hà Nội",
    },
    district: "Nam Từ Liêm",
    openingHours: { open: "08:00", close: "23:00" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600",
    ],
    menu: [
      { name: "Espresso", price: 38000 },
      { name: "Bánh bông lan trứng muối", price: 35000 },
    ],
    hashtags: ["wifi", "outlets", "quiet"],
    averageRating: 4.6,
    reviewCount: 22,
    location: { type: "Point" as const, coordinates: [105.7801, 21.0225] },
  },
  {
    name: { ja: "バクトゥリエム・ライブラリー", vi: "Bắc Từ Liêm Library Cafe" },
    description: {
      ja: "本に囲まれたアカデミックな雰囲気の静かなカフェ。勉強や執筆に最適です。",
      vi: "Không gian học thuật yên tĩnh bao quanh bởi sách. Lý tưởng để học tập và viết lách.",
    },
    address: {
      ja: "88 ホンクオックベト通り、バクトゥリエム区、ハノイ",
      vi: "88 Hoàng Quốc Việt, Bắc Từ Liêm, Hà Nội",
    },
    district: "Bắc Từ Liêm",
    openingHours: { open: "08:00", close: "21:30" },
    isOpen: true,
    images: [
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=600",
    ],
    menu: [
      { name: "Trà Ô Long", price: 40000 },
      { name: "Bánh phô mai", price: 45000 },
    ],
    hashtags: ["wifi", "quiet", "japanese"],
    averageRating: 4.2,
    reviewCount: 5,
    location: { type: "Point" as const, coordinates: [105.7885, 21.0475] },
  },
];

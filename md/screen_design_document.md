# Screen Design Document — What to do

> Source: `csv/screen_design_document.csv`

## Screen 3.0: ホーム（ゲストユーザー向け店舗一覧）

### Item 1.0: ログイン

**What to do:** クリックするとログイン画面へ遷移します
Nhấn vào sẽ chuyển tới màn hình đăng nhập

**Notes:**

> ログイン
> Đăng nhập

### Item 2.0: 新規登録

**What to do:** クリックすると新規登録画面へ遷移します
Nhấn vào sẽ chuyển tới màn hình đăng ký

**Notes:**

> 新規登録
> Đăng ký

### Item 3.0: お気に入りボタン

**What to do:** ゲストユーザーがクリックした場合はログイン画面へ遷移し、ログイン済みユーザーの場合はお気に入り状態を切り替えります
Nếu khách vãng lai nhấn vào thì chuyển tới màn hình đăng nhập, nếu người dùng đã đăng nhập thì chuyển đổi trạng thái yêu thích

**Notes:**

> お気に入りボタン
> Nút yêu thích

## Screen 4.0: ゲスト向け店舗詳細画面

### Item 1.0: ロゴ

**What to do:** 画面上部に表示 
 Hiển thị đầu trang

**Notes:**

> ロゴ
>  Logo

### Item 2.0: 「ホーム」ボタン

**What to do:** ホームURLへ遷移
Chuyển hướng về URL Home

**Notes:**

> 「ホーム」ボタン
> Nút "Trang chủ"

### Item 3.0: 言語切替

**What to do:** 全画面の言語を変更
Thay đổi ngôn ngữ toàn trang

**Notes:**

> 言語切替
> Chọn ngôn ngữ

### Item 4.0: 店名

**What to do:** DBから取得して表示
Lấy dữ liệu từ DB và hiển thị

**Notes:**

> 店名
> Tên quán

### Item 5.0: 評価

**What to do:** 平均評価を算出
Tính toán đánh giá trung bình

**Notes:**

> 評価
> Đánh giá

### Item 6.0: 営業時間

**What to do:** 営業時間を表示します
Hiển thị giờ mở cửa

**Notes:**

> 営業時間
> Giờ mở cửa

### Item 7.0: 説明

**What to do:** 店舗紹介を表示します
Hiển thị giới thiệu

**Notes:**

> 説明
> Mô tả

### Item 8.0: ハッシュタグ

**What to do:** 関連情報を表示します
Hiển thị thông tin liên quan

**Notes:**

> ハッシュタグ
> Hashtag

### Item 9.0: 住所

**What to do:** 位置情報を表示します
Hiển thị vị trí

**Notes:**

> 住所
> Địa chỉ

### Item 10.0: 営業状態

**What to do:** 状態を表示します
Hiển thị trạng thái

**Notes:**

> 営業状態
> Trạng thái quán

### Item 11.0: メニュー

**What to do:** メニュー一覧を表示します
Hiển thị danh sách món

**Notes:**

> メニュー
> Menu đặc trưng

### Item 12.0: レビュータイトル

**What to do:** セクションタイトルを表示します
Hiển thị tiêu đề

**Notes:**

> レビュータイトル
> Tiêu đề đánh giá

### Item 13.0: コメント数

**What to do:** コメント数を表示します
Hiển thị số bình luận

**Notes:**

> コメント数
> Số bình luận

### Item 14.0: コメント内容

**What to do:** コメントを表示します
Hiển thị danh sách bình luận

**Notes:**

> コメント内容
> Nội dung bình luận

## Screen 1.0: 新規登録

### Item 1.0: ロゴ 

**What to do:** 画面上部に表示 
 Hiển thị đầu trang

**Notes:**

> ロゴ 
> Logo

### Item 2.0: 登録タイトル 

**What to do:** フォーム上部に表示 
 Hiển thị trên form

**Notes:**

> 登録タイトル 
> Tiêu đề đăng ký

### Item 3.0: 氏名入力 

**What to do:** 必須入力チェック 
 Bắt buộc nhập

**Notes:**

> 氏名入力 
>  Họ tên

### Item 4.0: メールアドレス 

**What to do:** 形式チェック＋必須 
 Validate format + bắt buộc

**Notes:**

> メールアドレス 
>  Email

### Item 5.0: パスワード 

**What to do:** 桁数チェック 
 Kiểm tra độ dài

**Notes:**

> パスワード 
>  Mật khẩu

### Item 6.0: 役割

**What to do:** 必須入力チェック・選択値保存
Bắt buộc chọn・Lưu giá trị /

**Notes:**

> 役割
> Vai trò

### Item 7.0: 登録ボタン 

**What to do:** API送信 
 Gửi API đăng ký

**Notes:**

> 登録ボタン 
>  Nút đăng ký

### Item 8.0: ログインリンク 

**What to do:** 画面遷移 
 Điều hướng màn hình

**Notes:**

> ログインリンク 
>  Link đăng nhập

### Item 9.0: 利用規約 

**What to do:** 外部内部遷移 
 Mở trang

**Notes:**

> 利用規約 
>  Điều khoản dịch vụ

### Item 10.0: プライバシーポリシー 

**What to do:** 外部内部遷移 
 Mở trang

**Notes:**

> プライバシーポリシー 
> Chính sách bảo mật

### Item 11.0: 戻るボタン

**What to do:** 画面遷移（戻ります）
Điều hướng quay lại

**Notes:**

> 戻るボタン
> Nút quay lại

## Screen 2.0: ログイン

### Item 1.0: ロゴ

**What to do:** 画面上部に表示 
 Hiển thị đầu trang

**Notes:**

> ロゴ
>  Logo

### Item 2.0: ログインタイトル 

**What to do:** フォーム上部に表示 
 Hiển thị trên form

**Notes:**

> ログインタイトル 
> Tiêu đề đăng nhập

### Item 3.0: メールアドレス 

**What to do:** 形式チェック＋必須 
Validate format + bắt buộc

**Notes:**

> メールアドレス 
>  Email

### Item 4.0: パスワード 

**What to do:** 桁数チェック 
Kiểm tra độ dài

**Notes:**

> パスワード 
>  Mật khẩu

### Item 5.0: パスワードをお忘れですか

**What to do:** クリックすると登録メールアドレスにパスワードを送信します
Khi nhấn sẽ gửi mật khẩu đến email đã đăng ký

**Notes:**

> パスワードをお忘れですか
> Quên mật khẩu

### Item 6.0: ログインボタン

**What to do:** メールとパスワードを認証します
Xác thực email và mật khẩu

**Notes:**

> ログインボタン
> Nút đăng nhập

### Item 7.0: 新規登録

**What to do:** 新規登録ページへ遷移
Chuyển sang trang đăng ký

**Notes:**

> 新規登録
> Đăng ký

### Item 8.0: 利用規約 

**What to do:** 外部内部遷移 
Mở trang

**Notes:**

> 利用規約 
>  Điều khoản dịch vụ

### Item 9.0: プライバシーポリシー 

**What to do:** 外部内部遷移 
Mở trang

**Notes:**

> プライバシーポリシー 
> Chính sách bảo mật

### Item 10.0: 戻るボタン

**What to do:** 画面遷移（戻ります）
Điều hướng quay lại

**Notes:**

> 戻るボタン
> Nút quay lại

## Screen 5.0: 店舗一覧画面（ログインユーザー向け）

### Item 1.0: ロゴ 

**What to do:** 画面上部に表示 
 Hiển thị đầu trang

**Notes:**

> ロゴ 
>  Logo

### Item 2.0: ホーム 

**What to do:** クリックでホーム画面へ遷移します
Nhấn để chuyển về trang chủ

**Notes:**

> ホーム 
>  Trang chủ

### Item 3.0: 言語切替 

**What to do:** 選択した言語に応じて画面内文言を切り替えります
Đổi toàn bộ ngôn ngữ giao diện theo lựa chọn

**Notes:**

> 言語切替 
>  Chuyển ngôn ngữ

### Item 4.0: アカウントアイコン

**What to do:** クリックするとアカウントメニューを表示します
Nhấn vào sẽ hiển thị menu tài khoản

**Notes:**

> アカウントアイコン
> Biểu tượng tài khoản

### Item 5.0: 個人情報 / ログイン

**What to do:** ユーザー状態に応じて該当画面へ遷移します
Điều hướng tới màn hình tương ứng theo trạng thái người dùng

**Notes:**

> 個人情報 / ログイン
> Thông tin / Đăng nhập

### Item 6.0: ログアウト / 新規登録

**What to do:** ログイン時はセッションを終了し、未ログイン時は登録画面へ遷移します
Nếu đã đăng nhập thì kết thúc phiên làm việc, nếu chưa đăng nhập thì chuyển tới màn hình đăng ký

**Notes:**

> ログアウト / 新規登録
> Đăng xuất / Đăng ký

### Item 7.0: メインタイトル

**What to do:** ヒーローエリア中央に固定表示します
Hiển thị cố định tại khu vực trung tâm của banner chính

**Notes:**

> メインタイトル
> Tiêu đề chính

### Item 8.0: 地域選択

**What to do:** 選択した地域で店舗一覧を絞り込みます
Lọc danh sách quán theo khu vực đã chọn

**Notes:**

> 地域選択
> Chọn khu vực

### Item 9.0: 店舗検索入力欄

**What to do:** 入力されたキーワードに基づいて検索条件を設定します
Thiết lập điều kiện tìm kiếm dựa trên từ khóa đã nhập

**Notes:**

> 店舗検索入力欄
> Ô tìm kiếm quán cà phê

### Item 10.0: 検索ボタン

**What to do:** 地域、キーワード、フィルター条件に応じて店舗一覧を更新します
Cập nhật danh sách quán theo khu vực, từ khóa và điều kiện lọc

**Notes:**

> 検索ボタン
> Nút tìm kiếm

### Item 11.0: フィルター展開ボタン

**What to do:** クリックするとフィルター項目一覧を展開します
Nhấn vào sẽ mở danh sách các tiêu chí lọc

**Notes:**

> フィルター展開ボタン
> Nút mở bộ lọc

### Item 12.0: フィルターパネル

**What to do:** 選択した条件で店舗一覧を絞り込み、「適用」で反映し、「取消」で解除します
Lọc danh sách quán theo điều kiện đã chọn, nhấn “Áp dụng” để thực hiện, nhấn “Hủy bỏ” để xóa chọn

**Notes:**

> フィルターパネル
> Bảng bộ lọc

### Item 13.0: おすすめカフェ見出し

**What to do:** 一覧セクションのタイトルとして固定表示します
Hiển thị cố định như tiêu đề của khu vực danh sách

**Notes:**

> おすすめカフェ見出し
> Tiêu đề quán nổi bật

### Item 14.0: お気に入りボタン

**What to do:** クリックするとお気に入り状態を切り替えります
Nhấn vào sẽ chuyển đổi trạng thái yêu thích

**Notes:**

> お気に入りボタン
> Nút yêu thích

### Item 15.0: ハッシュタグ表示

**What to do:** 店舗に設定されたタグをカード下部に表示します
Hiển thị các hashtag đã gán cho quán ở phía dưới thẻ

**Notes:**

> ハッシュタグ表示
> Hiển thị hashtag

### Item 16.0: 詳細表示ボタン

**What to do:** クリックした店舗の詳細情報画面へ遷移します
Chuyển tới màn hình chi tiết của quán được chọn

**Notes:**

> 詳細表示ボタン
> Nút xem

### Item 17.0: 店舗画像

**What to do:** 一覧カード上部に店舗画像を表示します
Hiển thị ảnh quán ở phần trên của thẻ danh sách

**Notes:**

> 店舗画像
> Ảnh quán

### Item 18.0: 店舗情報表示領域

**What to do:** 店舗データをカード内に表示します
Hiển thị dữ liệu của quán trong thẻ

**Notes:**

> 店舗情報表示領域
> Vùng hiển thị thông tin quán

## Screen 6.0: 店舗詳細画面（ログインユーザー向け）

### Item 1.0: ロゴ 

**What to do:** 画面上部に表示 
 Hiển thị đầu trang

**Notes:**

> ロゴ 
>  Logo

### Item 2.0: 店舗名 

**What to do:** 店舗名 
Tên quán

### Item 3.0: 保存 

**What to do:** お気に入りリストに登録・削除します
 Thêm hoặc xóa khỏi danh sách yêu thích

**Notes:**

> 保存 
> Bookmark

### Item 4.0: 評価 

**What to do:** 平均点と総件数を算出して表示します
Tính toán và hiển thị điểm TB sao  và tổng số lượt

**Notes:**

> 評価 
> Xếp hạng

### Item 5.0: 営業時間 

**What to do:** 店舗の営業時間を表示します
 Hiển thị thời gian mở cửa của cửa hàng

**Notes:**

> 営業時間 
> Giờ mở cửa

### Item 6.0: 説明

**What to do:** 店舗の紹介文とおすすめメニューを表示 
Hiển thị bài giới thiệu và menu đề xuất

**Notes:**

> 説明
>  Mô tả quán

### Item 7.0: ハッシュタグ 

**What to do:** 関連タグを表示 
Hiển thị các tag liên quan

**Notes:**

> ハッシュタグ 
> Hashtag

### Item 8.0: 住所 

**What to do:** 住所を表示。クリックで地図アプリ起動 
 Hiển thị địa chỉ. Click để mở bản đồ

**Notes:**

> 住所 
> Địa chỉ

### Item 9.0: 営業状態 

**What to do:** システム時間に基づき表示 
Hiển thị theo giờ

**Notes:**

> 営業状態 
> Trạng thái quán

### Item 10.0: おすすめメニュー 

**What to do:** スライド形式で商品を表示 
Hiển thị dạng slide

**Notes:**

> おすすめメニュー 
> Menu

### Item 11.0: ホームボタン

**What to do:** クリックでホーム画面へ遷移
Click chuyển về màn hình trang chủ

**Notes:**

> ホームボタン
> Nút Home

### Item 12.0: 言語選択

**What to do:** 選択した言語で画面全体を再描画
Vẽ lại toàn bộ giao diện theo ngôn ngữ chọn

**Notes:**

> 言語選択
> Chọn ngôn ngữ

### Item 13.0: 情報メニュー

**What to do:** クリックで個人情報フォームを表示
Click hiển thị form thông tin cá nhân

**Notes:**

> 情報メニュー
> Menu Thông tin

### Item 14.0: ログアウト

**What to do:** セッション削除→ログイン画面へ遷移
Xóa phiên → chuyển về màn hình đăng nhập

**Notes:**

> ログアウト
> Đăng xuất

### Item 15.0: レビュー

**What to do:** レビュー一覧のタイトルを表示します 
Hiển thị tiêu đề của danh sách đánh giá

**Notes:**

> レビュー
>  Đánh giá

### Item 16.0: レビュー一覧 

**What to do:** 過去のレビューを表示 
Hiển thị review cũ

**Notes:**

> レビュー一覧 
> Review cũ

### Item 17.0: レビュータイトル 

**What to do:** コメント入力と星評価選択のタイトル 
Tiêu đề hiển thị phần nhận xét và chọn sao

**Notes:**

> レビュータイトル 
> Tiêu đề

### Item 18.0: 評価入力 

**What to do:** ユーザーが選択した星数を保持 
Lưu số sao chọn

**Notes:**

> 評価入力 
> Chọn sao

### Item 19.0: コメント入力 

**What to do:** レビュー内容を入力します
Nhập nội dung review

**Notes:**

> コメント入力 
> Ô nhập liệu

### Item 20.0: レビュー送信 

**What to do:** 入力内容を保存し、一覧を更新します
 Lưu nội dung nhập và cập nhật danh sách

**Notes:**

> レビュー送信 
> Gửi review

## Screen 7.0: 個人情報ページ（ログインユーザー向け）

### Item 1.0: ロゴ 

**What to do:** 画面左上部に表示
Hiển thị góc trên bên trái màn hình

**Notes:**

> ロゴ 
> Logo

### Item 2.0: ホームボタン

**What to do:** クリックでホーム画面へ遷移
Click chuyển về màn hình trang chủ

**Notes:**

> ホームボタン
> Nút Home

### Item 3.0: 言語選択

**What to do:** 選択した言語で画面全体を再描画
Vẽ lại toàn bộ giao diện theo ngôn ngữ chọn

**Notes:**

> 言語選択
> Chọn ngôn ngữ

### Item 4.0: ユーザーアイコン

**What to do:** クリックでドロップダウンメニュー表示
Click hiển thị menu dropdown

**Notes:**

> ユーザーアイコン
> Icon người dùng

### Item 5.0: 情報メニュー

**What to do:** クリックで個人情報フォームを表示
Click hiển thị form thông tin cá nhân

**Notes:**

> 情報メニュー
> Menu Thông tin

### Item 6.0: ログアウト

**What to do:** セッション削除→ログイン画面へ遷移
Xóa phiên → chuyển về màn hình đăng nhập

**Notes:**

> ログアウト
> Đăng xuất

### Item 7.0: セクションタイトル

**What to do:** 固定表示（編集不可）
Hiển thị cố định (không chỉnh sửa được)

**Notes:**

> セクションタイトル
> Tiêu đề mục

### Item 8.0: カフェリスト切替タブ

**What to do:** 固定表示（編集不可）
Hiển thị cố định (không chỉnh sửa được)

**Notes:**

> カフェリスト切替タブ
> Danh sách quán

### Item 9.0: カフェカード

**What to do:** カードクリックでユーザー向け店舗詳細画面へ遷移・ブックマークアイコンは黄色で表示
Click card chuyển đến trang chi tiết quán dành cho người tìm quán・Icon bookmark hiển thị màu vàng

**Notes:**

> カフェカード
> Card quán cà phê

### Item 10.0: カフェサムネイル

**What to do:** DBからカフェ画像URLを取得して表示
Lấy URL ảnh quán từ DB và hiển thị

**Notes:**

> カフェサムネイル
> Ảnh thumbnail quán

### Item 11.0: カフェ名称

**What to do:** DBからカフェ名を取得して表示
Lấy tên quán từ DB và hiển thị

**Notes:**

> カフェ名称
> Tên quán

### Item 12.0: カフェ住所

**What to do:** DBから住所を取得して表示
Lấy địa chỉ từ DB và hiển thị

**Notes:**

> カフェ住所
> Địa chỉ quán

### Item 13.0: 星評価（アイコン）

**What to do:** 評価値に応じて星の数を描画
Vẽ số sao tương ứng với điểm đánh giá

**Notes:**

> 星評価（アイコン）
> Icon đánh giá sao

### Item 14.0: 評価数値

**What to do:** DBから平均評価を計算して表示
Tính và hiển thị điểm trung bình từ DB

**Notes:**

> 評価数値
> Điểm đánh giá số

### Item 15.0: ユーザー情報パネル

**What to do:** ログインユーザー情報を取得してパネル内に表示
Lấy thông tin người dùng đăng nhập và hiển thị trong panel

**Notes:**

> ユーザー情報パネル
> Panel thông tin người dùng

### Item 16.0: ユーザーアバター

**What to do:** DBからユーザー画像を取得して表示
Lấy ảnh người dùng từ DB và hiển thị

**Notes:**

> ユーザーアバター
> Ảnh đại diện người dùng

### Item 17.0: ユーザー名

**What to do:** DBからユーザー名を取得して表示
Lấy tên người dùng từ DB và hiển thị

**Notes:**

> ユーザー名
> Tên người dùng

### Item 18.0: 編集ボタン

**What to do:** クリックで右側の個人情報フォームを開く
Click mở form thông tin cá nhân ở phía phải

**Notes:**

> 編集ボタン
> Nút chỉnh sửa

### Item 19.0: フォームタイトル

**What to do:** 固定表示（編集不可）
Hiển thị cố định (không chỉnh sửa được)

**Notes:**

> フォームタイトル
> Tiêu đề form

### Item 20.0: アバタープレビュー

**What to do:** 現在のアバター画像を円形で表示
Hiển thị ảnh đại diện hiện tại dạng hình tròn

**Notes:**

> アバタープレビュー
> Xem trước avatar

### Item 21.0: アバター変更ボタン

**What to do:** クリックでファイル選択ダイアログを開く
Click mở hộp thoại chọn file

**Notes:**

> アバター変更ボタン
> Nút thay đổi ảnh

### Item 22.0: ユーザー名表示

**What to do:** DBからユーザー名を取得して表示
Lấy tên người dùng từ DB và hiển thị

**Notes:**

> ユーザー名表示
> Hiển thị tên người dùng

### Item 23.0: 氏名編集ボタン

**What to do:** クリックで氏名フィールドを編集可能状態に切替
Click chuyển trường tên sang trạng thái có thể chỉnh sửa

**Notes:**

> 氏名編集ボタン
> Nút chỉnh sửa tên

### Item 24.0: メールアドレス表示

**What to do:** DBからメールアドレスを取得して表示（編集不可）
Lấy email từ DB và hiển thị (không chỉnh sửa được)

**Notes:**

> メールアドレス表示
> Hiển thị địa chỉ email

### Item 25.0: メール変更不可メッセージ

**What to do:** 固定表示
Hiển thị cố định

**Notes:**

> メール変更不可メッセージ
> Thông báo không thể thay đổi email

### Item 26.0: キャンセルボタン

**What to do:** 変更を破棄してフォームを閉じる / 元の値に戻します
Hủy thay đổi, đóng form / trả về giá trị ban đầu

**Notes:**

> キャンセルボタン
> Nút hủy

### Item 27.0: 保存ボタン

**What to do:** 入力値バリデーション→APIに送信→成功時はトースト表示＆フォーム閉じます
Validate dữ liệu → gửi API → thành công: hiện toast & đóng form

**Notes:**

> 保存ボタン
> Nút lưu thay đổi

## Screen 8.0: 店舗オーナー情報ページ

### Item 1.0: ロゴ 

**What to do:** 画面左上部に表示
Hiển thị góc trên bên trái màn hình

**Notes:**

> ロゴ 
> Logo

### Item 2.0: 画面タイトル

**What to do:** 「DANH SÁCH QUÁN CỦA TÔI」を表示
Hiển thị "DANH SÁCH QUÁN CỦA TÔI"

**Notes:**

> 画面タイトル
> Tiêu đề màn hình

### Item 3.0: オーナーラベル

**What to do:** 権限表示 
Hiển thị quyền hạn

**Notes:**

> オーナーラベル
> Nhãn vai trò

### Item 4.0: オーナーのアバター表示

**What to do:** DBからユーザー画像を取得して円形で表示
Lấy ảnh người dùng từ DB và hiển thị dạng hình tròn

**Notes:**

> オーナーのアバター表示
> Hiển thị ảnh đại diện chủ quán

### Item 5.0: リストタイトル

**What to do:** 固定表示
 Hiển thị cố định

**Notes:**

> リストタイトル
> Tiêu đề danh sách

### Item 6.0: オーナー詳細情報

**What to do:** DBから氏名とメールを取得して表示
Lấy tên và email từ DB và hiển thị

**Notes:**

> オーナー詳細情報
> Thông tin chi tiết chủ quán

### Item 7.0: プロフィール編集ボタン

**What to do:** 編集画面を表示 
Hiển thị màn hình chỉnh sửa

**Notes:**

> プロフィール編集ボタン
> Nút chỉnh sửa hồ sơ

### Item 8.0: 店写真

**What to do:** DBからカフェ画像URLを取得して表示
Lấy URL ảnh quán từ DB và hiển thị

**Notes:**

> 店写真
> Ảnh quán

### Item 9.0: 店名

**What to do:** 固定表示 
 Hiển thị cố định

**Notes:**

> 店名
> Tên quán

### Item 10.0: 店住所

**What to do:** 固定表示 
Hiển thị cố định

**Notes:**

> 店住所
> Địa chỉ quán

### Item 11.0: 評価

**What to do:** 自動計算 
 Tính tự động

**Notes:**

> 評価
> Đánh giá

### Item 12.0: 削除ボタン

**What to do:** 店舗削除 
 Xóa cửa hàng

**Notes:**

> 削除ボタン
> Nút xóa

### Item 13.0: 店舗行

**What to do:** 固定表示 
Hiển thị cố định

**Notes:**

> 店舗行
> Dòng thông tin quán

### Item 14.0: 店追加ボタン

**What to do:** 登録フォームを開きます 
Mở form đăng ký

**Notes:**

> 店追加ボタン
> Nút thêm quán

### Item 15.0: 言語選択

**What to do:** UI言語変更 
Thay đổi ngôn ngữ

**Notes:**

> 言語選択
> Lựa chọn ngôn ngữ

### Item 16.0: プロフィールアイコン

**What to do:** プロフィール画面へ移動 
 Mở trang hồ sơ

**Notes:**

> プロフィールアイコン
> Biểu tượng hồ sơ

### Item 17.0: プロフィール表示

**What to do:** 固定表示 
Hiển thị cố định

**Notes:**

> プロフィール表示
> Thông tin

### Item 18.0: ログアウト

**What to do:** セッション終了 
Kết thúc phiên

**Notes:**

> ログアウト
> Đăng xuất

### Item 19.0: 個人情報更新フォームのタイトル

**What to do:** 固定表示 
Hiển thị cố định

**Notes:**

> 個人情報更新フォームのタイトル
> Tiêu đề form cập nhật thông tin cá nhân

### Item 20.0: アバター表示

**What to do:** 固定表示 
Hiển thị cố định

**Notes:**

> アバター表示
> Hiển thị ảnh

### Item 21.0: 写真変更ボタン

**What to do:** 画像更新 
Cập nhật ảnh

**Notes:**

> 写真変更ボタン
> Thay đổi ảnh

### Item 22.0: 氏名入力欄

**What to do:** 名前保存 
Lưu tên

**Notes:**

> 氏名入力欄
> Trường nhập tên

### Item 23.0: 名前編集アイコン

**What to do:** 入力情報保存 
 Lưu thông tin nhập

**Notes:**

> 名前編集アイコン
> Icon sửa tên

### Item 24.0: メールアドレス表示

**What to do:** 編集不可 
Không chỉnh sửa

**Notes:**

> メールアドレス表示
> Địa chỉ Email

### Item 25.0: 変更不可通知

**What to do:** 通知表示 
Hiển thị thông báo

**Notes:**

> 変更不可通知
> Thông báo không thể đổi

### Item 26.0: キャンセルボタン

**What to do:** 前画面へ戻ります 
Quay lại màn hình trước

**Notes:**

キャンセルボタン

### Item 27.0: 保存ボタン

**What to do:** 編集情報保存 
 Lưu thông tin chỉnh sửa

**Notes:**

> 保存ボタン
> Nút Lưu thay đổi

### Item 28.0: 戻るボタン

**What to do:** 一覧画面へ戻ります
 Quay lại danh sách

**Notes:**

> 戻るボタン
> Nút quay lại

### Item 29.0: 店追加タイトル

**What to do:** 固定表示 
 Hiển thị cố định

**Notes:**

> 店追加タイトル
> Tiêu đề thêm quán

### Item 30.0: 店名入力

**What to do:** 店名保存 
Lưu tên cửa hàng

**Notes:**

> 店名入力
> Tên quán

### Item 31.0: 店舗写真URL

**What to do:** 画像保存 
 Lưu ảnh

**Notes:**

> 店舗写真URL
> URL ảnh quán

### Item 32.0: 営業時間入力

**What to do:** 営業時間保存 
 Lưu giờ hoạt động

**Notes:**

> 営業時間入力
> Giờ hoạt động

### Item 33.0: 店住所入力

**What to do:** 住所保存 
Lưu địa chỉ

**Notes:**

> 店住所入力
> Địa chỉ

### Item 34.0: 店説明入力

**What to do:** 店舗説明保存 
 Lưu mô tả cửa hàng

**Notes:**

> 店説明入力
> Mô tả quán

### Item 35.0: ハッシュタグ選択

**What to do:** 特徴保存 
Lưu đặc điểm quán

**Notes:**

> ハッシュタグ選択
> Hashtag

### Item 36.0: 店舗ステータス

**What to do:** 状態更新 
Cập nhật trạng thái

**Notes:**

> 店舗ステータス
> Trạng thái quán

### Item 37.0: メニュー項目入力

**What to do:** メニュー保存 
 Lưu món ăn

**Notes:**

> メニュー項目入力
> Menu đặc trưng

### Item 38.0: 行削除ボタン

**What to do:** メニュー削除 
 Xóa món ăn

**Notes:**

> 行削除ボタン
> Nút xóa dòng

### Item 39.0: 項目追加ボタン

**What to do:** メニュー追加 
Thêm món mới

**Notes:**

> 項目追加ボタン
> Thêm món mới

### Item 40.0: 店舗情報保存

**What to do:** 全ての入力情報を検証しDBへ登録
Kiểm tra toàn bộ thông tin nhập và đăng ký vào DB

**Notes:**

> 店舗情報保存
> Lưu thông tin

## Screen 9.0: 管理中店舗詳細画面

### Item 1.0: ホーム 

**What to do:** 画面上部に表示 
 Hiển thị đầu trang

**Notes:**

> ホーム 
> Home

### Item 2.0: 戻る

**What to do:** 前の画面へ遷移します
Chuyển về màn hình trước

**Notes:**

> 戻る
> Quay lại

### Item 3.0: 店舗名

**What to do:** 店舗情報を表示します
Hiển thị thông tin quán

**Notes:**

> 店舗名
> Tên quán

### Item 4.0: 評価

**What to do:** 評価情報を表示します
Hiển thị thông tin đánh giá

**Notes:**

> 評価
> Đánh giá

### Item 5.0: 営業時間 

**What to do:** 店舗の営業時間を表示します
 Hiển thị thời gian mở cửa của cửa hàng

**Notes:**

> 営業時間 
> Giờ mở cửa

### Item 6.0: 説明

**What to do:** 店舗の紹介文とおすすめメニューを表示
Hiển thị bài giới thiệu và menu đề xuất

**Notes:**

> 説明
> Mô tả quán

### Item 7.0: ハッシュタグ

**What to do:** 関連情報を表示します
Hiển thị thông tin liên quan

**Notes:**

> ハッシュタグ
> Hashtag

### Item 8.0: 住所

**What to do:** 表示： 店舗の住所情報を表示します
Hiển thị thông tin địa chỉ của quán.

**Notes:**

> 住所
>  Địa chỉ

### Item 9.0: 店舗状況

**What to do:** リアルタイムの混雑状況を表示します
 Hiển thị trạng thái đông đúc theo thời gian thực

**Notes:**

> 店舗状況
> Trạng thái quán

### Item 10.0: メニュー

**What to do:** 商品情報表示 
Hiển thị danh sách món

**Notes:**

> メニュー
> Menu đặc trưng

### Item 11.0: 編集ボタン

**What to do:** 編集画面へ遷移します
Chuyển sang trạng thái chỉnh sửa

**Notes:**

> 編集ボタン
> Nút chỉnh sửa

### Item 12.0: レビュー内容

**What to do:** コメント内容を表示します
Hiển thị bình luận

**Notes:**

> レビュー内容
> Nội dung đánh giá

### Item 13.0: 返信ボタン

**What to do:** 返信入力欄を表示します
Hiển thị ô nhập phản hồi

**Notes:**

> 返信ボタン
> Nút phản hồi

### Item 14.0: 言語切替

**What to do:** 言語を切り替えります
Thay đổi ngôn ngữ

**Notes:**

> 言語切替
> Ngôn ngữ

### Item 15.0: プロフィール

**What to do:** マイページへ遷移します
Chuyển đến trang cá nhân

**Notes:**

> プロフィール
> Tài khoản

### Item 16.0: 戻る

**What to do:** 前の画面へ遷移します
Chuyển về màn hình trước

**Notes:**

> 戻る
> Quay lại

### Item 17.0: 画面タイトル

**What to do:** タイトルを表示します
Hiển thị tiêu đề

**Notes:**

> 画面タイトル
> Tiêu đề màn hình

### Item 18.0: 店舗情報入力欄

**What to do:** 入力内容を保存用データとして取得します
Lấy dữ liệu nhập để lưu

**Notes:**

> 店舗情報入力欄
> Thông tin quán

### Item 19.0: ハッシュタグ選択

**What to do:** 選択したタグを保存します
Lưu các tag đã chọn

**Notes:**

> ハッシュタグ選択
> Chọn hashtag

### Item 20.0: 営業状態選択

**What to do:** 状態を設定します
Cập nhật trạng thái

**Notes:**

> 営業状態選択
> Trạng thái quán

### Item 21.0: メニュー追加

**What to do:** 新しいメニュー入力欄を表示します
Hiển thị dòng nhập menu mới

**Notes:**

> メニュー追加
> Thêm món

### Item 22.0: 保存ボタン

**What to do:** 入力内容を保存します
Lưu thông tin vào hệ thống

**Notes:**

> 保存ボタン
> Lưu thông tin

### Item 23.0: キャンセルボタン

**What to do:** 入力内容を破棄して画面を閉じます
Hủy nội dung và đóng cửa sổ

**Notes:**

> キャンセルボタン
> Hủy

### Item 24.0: コメント情報

**What to do:** コメント情報を表示します
Hiển thị thông tin bình luận

**Notes:**

> コメント情報
> Thông tin bình luận

### Item 25.0: 送信ボタン

**What to do:** 入力内容を送信して保存します
Gửi và lưu phản hồi

**Notes:**

> 送信ボタン
> Gửi phản hồi

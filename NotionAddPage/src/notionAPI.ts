import fetch from "node-fetch";
import { NOTION_API_KEY, DATABASE_ID } from "./env"; // 環墮変数を読み込む

// Notionに新しいページを作成する関数
export async function createPageInNotion(
  title: string, // ページのタイトル
  memo: string | null, // メモ内容（nullの場合あり）
  date: Date | null, // 日付 (ISO形式またはnullの場合あり)
): Promise<boolean> {
  const url = "https://api.notion.com/v1/pages"; // Notion APIのエンドポイント

  // タイトルが空の場合、falseを返して処理を終了
  if (!title) {
    return false;
  }

  // リクエストのヘッダーを設定
  const headers = {
    Authorization: `Bearer ${NOTION_API_KEY}`, // 環境変数からAPIキーを取得
    "Content-Type": "application/json",
    "Notion-Version": "2021-05-13",
  };

  // プロパティの定義
  const properties: any = {
    Name: {
      title: [{ text: { content: title } }], // ページのタイトルプロパティ
    },
  };

  // 日付が指定されている場合にのみDateプロパティを追加
  if (date) {
    // ローカルタイムを考慮した日付文字列の作成
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000); // タイムゾーン補正

    // 時間が含まれているかどうかを判定
    if (date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0) {
      // 時間が指定されている場合は、日時を含めて設定
      properties.Date = {
        date: {
          start: date, // ローカルタイムゾーンに補正した日時
          time_zone: "Asia/Tokyo", // タイムゾーンを設定
        },
      };
    } else {
      // 時間が指定されていない場合は、日付のみを設定
      const dateString = localDate.toISOString().split("T")[0]; // YYYY-MM-DD形式の日付部分だけを取得
      properties.Date = {
        date: {
          start: dateString, // ローカルタイムゾーンに補正した日付のみ
          time_zone: "Asia/Tokyo", // タイムゾーンを設定（必要に応じて）
        },
      };
    }
  }

  // メモが指定されている場合にのみMemo1プロパティを追加
  if (memo) {
    properties.メモ = {
      rich_text: [
        {
          text: {
            content: memo, // メモ内容をMemo1プロパティに設定
          },
        },
      ],
    };
  }

  // リクエストのボディをJSON形式で作成
  const body = JSON.stringify({
    parent: { database_id: DATABASE_ID }, // 親データベースのIDを指定
    properties: properties,
  });

  try {
    // Notion APIにPOSTリクエストを送信
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    // レスポンスが成功したかを確認
    if (response.ok) {
      return true; // 成功時にtrueを返す
    } else {
      console.error(`Failed to create page: ${response.statusText}`); // 失敗時にエラーメッセージを表示
      return false;
    }
  } catch (error) {
    console.error(`Error creating page: ${error}`); // エラー発生時にエラーメッセージを表示
    return false;
  }
}

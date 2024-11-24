export const todaysFlavor = (
  products: unknown[],
  mood: string = '普通の気分',
) => {
  return {
    text: `
      あなたは優秀なAIであり、以下のアイスクリームフレーバーのリストを理解してください。
      私の現在の気分は「${mood}」です。

      次のリストの中から、現在の気分「${mood}」に最も合うフレーバーを選んでください。

      ### 指示:
      - 必ず **1つのオブジェクト** を選んでください。
      - JSON形式でレスポンスを返してください。
      - フレーバーを選んだ理由を含めた感情に語りかける表現のメッセージを「message」フィールドに記載してください。
      - attribute が「通年商品以外」の場合は「limited」フィールドをtrueにしてください。
      - image と url はドメイン（${process.env.TARGET_DOMAIN}）に続くパスです。結合してください。

      ### 入力リスト:
      ${JSON.stringify(products, null, 2)}

      ### レスポンス形式:
      {
        "flavor": {
          "name": string,
          "url": string,
          "image": string,
          "limited": boolean
        },
        "message": string,
      }
    `,
  };
};

export type TodaysFlavor = typeof todaysFlavor;

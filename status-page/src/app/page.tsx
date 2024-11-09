export default async function Home(context) {
  const statusPageId = "sp_7ybE5tb6gFmQzm7ZLvQQxA";
  const statusPage = await fetch(
    process.env.API_BASE_URL + `/status-pages/${statusPageId}/status`
  );
  const statusPageData = await statusPage.json();
  console.log(context);

  return <div>{statusPageData.name}</div>;
}

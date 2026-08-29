import RankingListItem from './RankingListItem'

export default function RankingList({ memes }) {
  return (
    <div className="divide-y divide-edge">
      {memes.map((meme, index) => (
        <RankingListItem key={meme.id} meme={meme} rank={index + 1} />
      ))}
    </div>
  )
}

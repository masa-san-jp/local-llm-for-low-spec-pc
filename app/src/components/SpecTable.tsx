const ROWS = [
  {
    config: '8GB RAM / CPU-only',
    text: '推奨',
    image: '非推奨',
    camera: '非推奨',
    attach: '軽量ファイルのみ',
    archive: '推奨',
  },
  {
    config: '16GB RAM / CPU-only',
    text: '推奨',
    image: '推奨',
    camera: '推奨',
    attach: '推奨',
    archive: '推奨',
  },
]

const CELL_COLOR: Record<string, string> = {
  '推奨': 'text-green-600',
  '条件付き': 'text-yellow-600',
  '非推奨': 'text-red-400',
  '軽量ファイルのみ': 'text-yellow-600',
}

function SpecTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs">
        <thead className="bg-gray-100">
          <tr>
            {['構成', 'テキスト', '画像', 'カメラ', '添付', 'アーカイブ'].map((h) => (
              <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.config} className="border-t border-gray-100">
              <td className="px-3 py-2 text-gray-700 font-medium whitespace-nowrap">{row.config}</td>
              {[row.text, row.image, row.camera, row.attach, row.archive].map((v, i) => (
                <td key={i} className={`px-3 py-2 ${CELL_COLOR[v] ?? 'text-gray-600'}`}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { SpecTable }

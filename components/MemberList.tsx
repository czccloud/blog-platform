interface Member {
  id: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
}

export default function MemberList({ members }: { members: Member[] }) {
  return (
    <div className="space-y-2">
      {members.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg border border-cream-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cream-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {m.display_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-cream-950">{m.display_name}</p>
              <p className="text-xs text-cream-500">{m.email}</p>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              m.role === "admin" ? "bg-cream-400 text-white" : "bg-cream-100 text-cream-600"
            }`}
          >
            {m.role === "admin" ? "管理员" : "作者"}
          </span>
        </div>
      ))}
    </div>
  );
}

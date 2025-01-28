const columns = [
  {
    title: "Dex Number",
    dataIndex: "id",
    key: "id",
    sorter: (a: any, b: any) => a.id - b.id, // Sort by numeric ID
  },
  {
    title: "Sprite",
    dataIndex: "sprite",
    key: "sprite",
    render: (spriteLink: string) => (
      <img
        src={spriteLink}
        alt="Sprite of the current pokemon"
        style={{ width: 50 }}
      />
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    sorter: (a: any, b: any) => a.name.localeCompare(b.name), // Alphabetical sorting
  },
  {
    title: "Types",
    dataIndex: "types",
    key: "types",
    sorter: (a: any, b: any) => a.types.join(", ").localeCompare(b.types.join(", ")), // Sort by types alphabetically
    render: (types: string[]) => types.join(", "),
  },
  {
    title: "Total Stats",
    dataIndex: "totalStats",
    key: "totalStats",
    sorter: (a: any, b: any) => a.totalStats - b.totalStats, // Sort by total stats
  },
  {
    title: "Actions",
    key: "actions",
    render: (_: any, record: any) => (
      <Button type="primary" onClick={() => handleOpenDrawer(record)}>
        View Details
      </Button>
    ),
  },
];

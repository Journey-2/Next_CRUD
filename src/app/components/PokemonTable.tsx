import { Table, Button } from "antd";
import { usePokemonStore } from "../store/usePokeomonStore";
import { useRouter, useSearchParams } from "next/navigation";
 
const PokemonTable = ({
    data = [],
    isLoading,
    filteredData,
    paginatedData
  }: {
    data?: any[];
    isLoading: boolean;
    filteredData?: any;
    paginatedData?: any;
  }) => {
    const searchParams = useSearchParams();  
    const router = useRouter();
    const { currentPage, pageSize, setSelectedPokemon, setDrawerVisible, setPageSize } = usePokemonStore();
 
    const handleOpenDrawer = (pokemon: any) => {
        setSelectedPokemon(pokemon);
        setDrawerVisible(true);
      };
 
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/?${params.toString()}`);
    };
 
    const columns = [
        {
            title: "Dex Number",
            dataIndex: "id",
            key: "id",
          },
          {
            title: "Sprite",
            dataIndex: "sprite",
            key: "sprite",
            render: (spriteLink: string) => (
              <img src={spriteLink} alt="Sprite" style={{ width: 50 }} />
            ),
          },
          {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
            render : (name:string) =>{
              return name.charAt(0).toUpperCase() + name.slice(1)
            }
          },
          {
            title: "Types",
            dataIndex: "types",
            key: "types",
            render: (types: string[]=[]) => {
              return types
              .map((type:string)=>type.charAt(0).toUpperCase() + type.slice(1))
              .join(", ")
          }},
          {
            title: "totalStats",
            dataIndex: "totalStats",
            key : "totalStats",  
            sorter: (a: any, b: any) => a.totalStats - b.totalStats
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
    ]
 
    return (
        <Table
            columns={columns}
            dataSource={data}
            loading={isLoading}
            pagination={{
                current: currentPage,
                pageSize: pageSize,
                pageSizeOptions: ["10","20","50","100","1025"],
                onShowSizeChange:(current, size) => {setPageSize(size)},
                onChange: handlePageChange,
                total: filteredData ? filteredData.length : paginatedData?.total,
                showTotal : total => `Total ${total}`
            }}
        rowKey="id"
        />
    )
}
 
export default PokemonTable;
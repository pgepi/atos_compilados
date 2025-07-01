'use client';

import { fetchSheetData } from "@/services/googleSheets";
import { Button } from "@headlessui/react";
import { use, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react"
import { headers } from "next/headers";

interface SubDropdownItem {
  label: string;
  href?: string;
}

interface DropdownItem {
  label: string;
  href?: string;
  subItems?: SubDropdownItem[];
}


export default function Home() {

  const [header, setHeader] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);

  const [isError, setIsError] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);

  const [tags, setTags] = useState<{ [key: string]: number }>({});
  const [folders, setFolders] = useState<{ [key: string]: number }>({});

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const [foldertagselected, setFolderTagSelected] = useState<number[]>([0,0]);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [dropdownItems, setDropdownItems] = useState<DropdownItem[]>([
    {
      label: 'Normas',
      subItems: [
      ]
    },
    {
      label: 'Pasta',
      subItems: [
      ]
    }
  ]);

  const { theme, setTheme } = useTheme()
  

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  }

  useEffect(() => {

    setRows([]);

    fetchSheetData("1opD_KKUHti9WCBQbUsFmJofxqbUN9VxOX_GIycN6rS8", "A:F").then((data) => {
      if (data?.values) {
        setHeader(data.values[0]);
        setRows(data.values.slice(1));
      }
    }).catch(() => {
        setIsError(true);
    }).finally(() => {
    });
    
  }, [reload]);

  // tags da norma
  useEffect(() => {
    const result = rows.reduce((acc: { [key: string]: number }, row) => {
      if (row[0] === undefined || row[0] === "") {
        return acc;
      }
      const tags = row[0].split(",");
      tags.forEach((tag) => {
        if (acc[tag]) {
          acc[tag]++;
        } else {
          acc[tag] = 1;
        }
      });
      return acc;
    }, {});

    setTags(result);

  }, [header, rows]);

  // tags da localização/pasta
  useEffect(() => {
    const results = rows.reduce((acc: { [key: string]: number }, row) => {
      if (row[4] === undefined || row[4] === "") {
        return acc;
      }
      const tags = row[4].split(",");
      tags.forEach((tag) => {
        if (acc[tag]) {
          acc[tag]++;
        } else {
          acc[tag] = 1;
        }
      });

      return acc;
    }, {});

    setFolders(results);

  }, [header, rows]);

  useEffect(() => {
    setDropdownItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.label === "Normas") {
          return {
            ...item,
            subItems: Object.keys(tags).map((tag) => ({
              label: tag,
              href: `#${tag}`,
            })),
          };
        } else if (item.label === "Pasta") {
          return {
            ...item,
            subItems: Object.keys(folders).map((folder) => ({
              label: folder,
              href: `#${folder}`,
            })),
          };
        }
        return item;
      });
    });
  }, [tags, folders]);

  const handleFilterChange = (marker: string, tagOrFolder: boolean) => {
    // 0: folder, 1: tag
    if (tagOrFolder) {
      setSelectedFilters((prevFilters) => {

        if (prevFilters.includes(marker)) {
          setFolderTagSelected((prev) => {
            return [prev[0], prev[1] - 1];
          });
          return prevFilters.filter((filter) => filter !== marker);
        } else {
          setFolderTagSelected((prev) => {
            return [prev[0], prev[1] + 1];
          });
          return [...prevFilters, marker];
        }
      });
    } else {
      setSelectedFilters((prevFilters) => {
        if (prevFilters.includes(marker)) {
          setFolderTagSelected((prev) => {
            return [prev[0] - 1, prev[1]];
          });
          return prevFilters.filter((filter) => filter !== marker);
        } else {
          setFolderTagSelected((prev) => {
            return [prev[0] + 1, prev[1]];
          });
          return [...prevFilters, marker];
        }
      });
    }
  }

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredRows = rows.filter((row) =>{
    if (row.length < 5) {
      return false;
    }
    return (selectedFilters.length === 0 || selectedFilters.some((filter) => row[0].includes(filter)) || selectedFilters.some((filter) => row[4].includes(filter))) &&
    (searchQuery === "" || row.some((cell) => cell.toLowerCase().includes(searchQuery.toLowerCase())))
    }
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);

  const handleSubDropdownToggle = (label: string) => {
    setOpenSubDropdown(openSubDropdown === label ? null : label);
  };


  return (
    <div>
      <section className="bg-gray-50 dark:bg-gray-900 py-3 min-h-screen sm:py-5">
        <div className="px-4 mx-auto max-w-screen-2xl lg:px-12">
            <div className="relative bg-white shadow-md dark:bg-gray-800 sm:rounded-lg">
                <div style={{ top: 0, zIndex: 50 }} className="flex flex-col px-4 py-3 space-y-3 bg-white dark:bg-gray-800 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4 sticky">
                  <div className="w-full md:w-1/2">
                      <form className="flex items-center">
                        <label htmlFor="simple-search" className="sr-only">Pesquisar</label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                              type="text"
                              id="simple-search"
                              value={searchQuery}
                              onChange={handleSearchChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="Pesquisar"
                              required
                            />
                            </div>
                      </form>
                  </div>
                    <div className="flex min-h-full flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
                    <div className="relative flex items-center space-x-3 w-full md:w-auto">
                        <button 
                          onClick={() => {setIsFilterOpen(!isFilterOpen); setOpenSubDropdown(null)}} 
                          className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                          type="button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                          </svg>
                          Filtros
                          <svg className="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path clipRule="evenodd" fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </button>

                        <div className={`z-10 absolute top-full right-0 w-40 bg-white rounded-lg shadow dark:bg-gray-700 ${
                          isFilterOpen ? 'block' : 'hidden'
                        }`}>
                          <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                            {dropdownItems.map((item, index) => (
                              <li key={index}>
                                {item.subItems ? (
                                  <>
                                    <button
                                      onClick={() => handleSubDropdownToggle(item.label)}
                                      className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                    >
                                      {item.label}
                                      <span className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
                                        {item.label === "Normas" ? foldertagselected[1] : foldertagselected[0]}
                                      </span>
                                      <svg className="w-2.5 h-2.5 ms-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                                      </svg>
                                    </button>
                                    {openSubDropdown === item.label && (
                                      <div className="absolute left-full pl-3 top-0 w-60 bg-white rounded-lg shadow dark:bg-gray-700">
                                        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                          {item.subItems.map((subItem, subIndex) => (
                                            <li key={subIndex}>
                                              <input
                                                id={subItem.label}
                                                type="checkbox"
                                                checked={selectedFilters.includes(subItem.label)}
                                                onChange={() => handleFilterChange(subItem.label, item.label === "Normas" ? true : false)}
                                                className="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                              />
                                              <label htmlFor={subItem.label} className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">{capitalizeFirstLetter(subItem.label)} ({tags[subItem.label] || folders[subItem.label]})</label>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <a
                                    href={item.href}
                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  >
                                    {item.label}
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                        <button onClick={() => {setReload(!reload)}} type="button" className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                            
                            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Atualizar dados
                        </button>

                        {/* dark mode button */}
                        <Button 
                          onClick={() => {
                            setTheme(theme === "dark" ? "light" : "dark")
                          }}
                        className="flex items-center justify-center flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </Button>
                    </div>
                </div>
                <div className="overflow-auto max-h-[88vh]">
                {isError ? (
                    <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
                        <div className="flex items-center gap-3">
                            <svg className="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor" />
                            </svg>
                            <span className="text-red-500">Falha ao carregar dados</span>
                        </div>
                    </div>
                    ) : rows.length === 0 ? (
                    <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
                        <div className="flex items-end gap-8">
                        <svg className="w-12 h-12 text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                            <path
                            d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
                            stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
                            <path
                            d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
                            stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                            </path>
                        </svg>
                        </div>
                    </div>
                    ) : (
                      
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky ">
                        <tr>
                            {header.map((item, index) => (
                            <th key={index} scope="col" className="px-4 py-3 sticky top-0 bg-gray-50 dark:bg-gray-700">{item}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                          {filteredRows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                              {row.map((item, colIndex) => (
                                <td key={colIndex} className="px-4 py-2">
                                  {colIndex === header.length - 1 ? (
                                    <a href={item} className="text-blue-500 hover:underline flex" target="_blank" rel="noopener noreferrer">
                                      
                                      <svg width="15px" xmlns="http://www.w3.org/2000/svg" className="eVNhx7m5tjSVbfYQzDdT kbeH5ty3CtPKxXm5TXph b7Lf_ucBvHbZEidPjF8t mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                                      </svg>
                                      abrir
                                    </a>
                                  ) : (
                                    item
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {
                            // empty row
                            filteredRows.length === 0 && (
                              <tr>
                                <td colSpan={header.length} className="px-4 py-4 text-center">Nenhum resultado encontrado</td>
                              </tr>
                            )
                          }
                        </tbody>
                    </table>
                    )}
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}

import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ListRepository from "@/components/ListRepository";
import ListUser from "@/components/ListUser";
import Render from "@/components/Render";
import Select from "@/components/Select";
import { EOrder, ESearchCategory } from "@/interfaces/global.interface";
import {
  ERepositorySort,
  IGetRepositoriesParams,
} from "@/interfaces/repository.interface";
import { EUserSort, IGetUsersParams } from "@/interfaces/user.interface";
import styles from "@/styles/Home.module.scss";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const searchOptions: { label: string; value: ESearchCategory }[] = [
  {
    label: "Users",
    value: ESearchCategory.USERS,
  },
  {
    label: "Repositories",
    value: ESearchCategory.REPOSITORIES,
  },
];

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchKeyword, setSearchKeyword] = useState(
    decodeURIComponent(searchParams.get("q") || "") || ""
  );
  const [searchCategory, setSearchCategory] = useState<ESearchCategory>(
    (searchParams.get("category") as ESearchCategory) || ESearchCategory.USERS
  );
  const [getUsersParams, setGetUsersParams] = useState<IGetUsersParams>({
    q: "",
    sort: EUserSort.FOLLOWERS,
    page:
      searchCategory === ESearchCategory.USERS
        ? Number(searchParams.get("page")) || 1
        : 1,
    per_page: 9,
    order: EOrder.DESC,
  });
  const [getRepositoriesParams, setGetRepositoriesParams] =
    useState<IGetRepositoriesParams>({
      q: "",
      sort: ERepositorySort.STARTS,
      page:
        searchCategory === ESearchCategory.REPOSITORIES
          ? Number(searchParams.get("page")) || 1
          : 1,
      per_page: 9,
      order: EOrder.DESC,
    });

  useEffect(() => {
    setSearchKeyword("");
    if (inputRef.current) inputRef.current.focus();
  }, [searchCategory]);

  useEffect(() => {
    setGetUsersParams((prev) => ({ ...prev, page: 1 }));
    setGetRepositoriesParams((prev) => ({ ...prev, page: 1 }));
  }, [searchKeyword]);

  // * Update the query parameter in state based on search keyword and category with debounce
  useEffect(() => {
    const timeoutSearch = setTimeout(() => {
      if (searchCategory === ESearchCategory.USERS) {
        setGetUsersParams((prev) => ({ ...prev, q: searchKeyword }));
      } else {
        setGetRepositoriesParams((prev) => ({ ...prev, q: searchKeyword }));
      }
    }, 200); // Debounce to prevent too many API requests

    return () => clearTimeout(timeoutSearch); // Clear the timeout if the keyword or category changes
  }, [searchCategory, searchKeyword]);

  // * Set initial state from URL parameters
  useEffect(() => {
    const category = searchParams.get("category") as ESearchCategory;
    if (category === ESearchCategory.USERS) {
      setGetUsersParams((prev) => ({
        ...prev,
        page: Number(searchParams.get("page")) || 1,
      }));
    } else {
      setGetRepositoriesParams((prev) => ({
        ...prev,
        page: Number(searchParams.get("page")) || 1,
      }));
    }
    setSearchKeyword(decodeURIComponent(searchParams.get("q") || "") || "");
    setSearchCategory(category || ESearchCategory.USERS);
  }, []);

  // * Update the URL when state changes
  useEffect(() => {
    searchParams.set("category", searchCategory);
    searchParams.set(
      "page",
      searchCategory === ESearchCategory.USERS
        ? getUsersParams.page.toString()
        : getRepositoriesParams.page.toString()
    );
    searchParams.set("q", encodeURIComponent(searchKeyword));

    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  }, [
    getUsersParams.page,
    getRepositoriesParams.page,
    searchCategory,
    searchKeyword,
  ]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchCategory(e.target.value as ESearchCategory);
  };

  return (
    <main className={styles.Container}>
      <Header />
      <div className={styles.Form}>
        <Input
          placeholder="Typing to search users or repositories"
          value={searchKeyword}
          onChange={handleSearchInput}
          ref={inputRef}
          autoFocus
        />
        <Select onChange={handleSearchSelect}>
          {searchOptions.map((item) => (
            <option
              key={item.value}
              value={item.value}
              selected={item.value === searchCategory}
            >
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      {/* ------ If still not searching yet --------- */}
      <Render in={searchKeyword.length <= 3}>
        <EmptyState />
      </Render>

      {/* ------ To display list users --------- */}
      <ListUser
        getUsersParams={getUsersParams}
        searchCategory={searchCategory}
        searchKeyword={searchKeyword}
        setGetUsersParams={setGetUsersParams}
      />

      {/* ------ To display list repository --------- */}
      <ListRepository
        getRepositoriesParams={getRepositoriesParams}
        searchCategory={searchCategory}
        searchKeyword={searchKeyword}
        setGetRepositoriesParams={setGetRepositoriesParams}
      />
    </main>
  );
};

export default HomePage;

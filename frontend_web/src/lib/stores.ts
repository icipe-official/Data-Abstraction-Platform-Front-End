import { type Writable, writable } from 'svelte/store'
import type { ICatalogue, ICurrentProject, ICurrentUser, IFile, IModelTemplate, IProject, IProjectStorage, ISearchAbstraction, ISearchDirectory } from './interface'

//ui store
export let Loading: Writable<boolean> = writable(false)
export let LoadingMessage: Writable<string | null> = writable(null)
export let ToastMessage: Writable<string | string[] | null> = writable(null)
export let ToastType: Writable<string | null> = writable(null)

// Logged In Session store
export let CurrentUser: Writable<ICurrentUser | null> = writable(null)
export let CurrentProject: Writable<ICurrentProject | null> = writable(null)


// Directory store
export let DirectorySearchResults: Writable<ISearchDirectory[]> = writable([])
export let DirectorySearchCurrentQuery: Writable<string> = writable('')
export let DirectorySearchPreviousQuery: Writable<string> = writable('')
export let DirectorySearchCreatedOnGreaterThan: Writable<string> = writable('')
export let DirectorySearchCreatedOnLessThan: Writable<string> = writable('')
export let DirectorySearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let DirectorySearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let DirectorySearchLimit: Writable<number> = writable(1000)
export let DirectorySearchOffset: Writable<number> = writable(0)
export let DirectorySearchSortBy: Writable<string> = writable('last_updated_on')
export let DirectorySearchSortByOrder: Writable<string> = writable('desc')

// Catalogues store
export let CataloguesSearchResults: Writable<ICatalogue[]> = writable([])
export let CataloguesSearchCurrentQuery: Writable<string> = writable('')
export let CataloguesSearchPreviousQuery: Writable<string> = writable('')
export let CataloguesSearchUseCurrentProject: Writable<boolean> = writable(true)
export let CataloguesSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let CataloguesSearchCreatedOnLessThan: Writable<string> = writable('')
export let CataloguesSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let CataloguesSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let CataloguesSearchLimit: Writable<number> = writable(1000)
export let CataloguesSearchOffset: Writable<number> = writable(0)
export let CataloguesSearchSortBy: Writable<string> = writable('last_updated_on')
export let CataloguesSearchSortByOrder: Writable<string> = writable('desc')

// Model Templates store
export let ModelTemplatesSearchResults: Writable<IModelTemplate[]> = writable([])
export let ModelTemplatesSearchCurrentQuery: Writable<string> = writable('')
export let ModelTemplatesSearchPreviousQuery: Writable<string> = writable('')
export let ModelTemplatesSearchUseCurrentProject: Writable<boolean> = writable(true)
export let ModelTemplatesSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let ModelTemplatesSearchCreatedOnLessThan: Writable<string> = writable('')
export let ModelTemplatesSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let ModelTemplatesSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let ModelTemplatesSearchLimit: Writable<number> = writable(1000)
export let ModelTemplatesSearchOffset: Writable<number> = writable(0)
export let ModelTemplatesSearchSortBy: Writable<string> = writable('last_updated_on')
export let ModelTemplatesSearchSortByOrder: Writable<string> = writable('desc')

// Files Store
export let FilesSearchResults: Writable<IFile[]> = writable([])
export let FilesSearchCurrentQuery: Writable<string> = writable('')
export let FilesSearchPreviousQuery: Writable<string> = writable('')
export let FilesSearchUseCurrentProject: Writable<boolean> = writable(true)
export let FilesSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let FilesSearchCreatedOnLessThan: Writable<string> = writable('')
export let FilesSearchLimit: Writable<number> = writable(1000)
export let FilesSearchOffset: Writable<number> = writable(0)
export let FilesSearchSortBy: Writable<string> = writable('created_on')
export let FilesSearchSortByOrder: Writable<string> = writable('desc')
export let FilesSearchFileWithAbstractions: Writable<string> = writable('')

// Search Results Store
export let SearchResultsClickedIndex: Writable<number | null> = writable(null)
export let ProjectsSearchResults: Writable<IProject[]> = writable([])

// Available Project Storage Options
export let ProjectStorage: Writable<IProjectStorage[]> = writable([])

// Abstractions store
export let AbstractionsSearchResults: Writable<ISearchAbstraction[]> = writable([])
export let AbstractionEditorsSearchResults: Writable<ISearchDirectory[]> = writable([])
export let AbstractionCurrentTemplate: Writable<IModelTemplate | null> = writable(null)
export let AbstractionsSearchCurrentAbstractor: Writable<ISearchDirectory | null> = writable(null)
export let AbstractionsSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let AbstractionsSearchCreatedOnLessThan: Writable<string> = writable('')
export let AbstractionsSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let AbstractionsSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let AbststractionsSearchIsVerified: Writable<string> = writable('')
export let AbstractionsSearchLimit: Writable<number> = writable(1000)
export let AbstractionsSearchOffset: Writable<number> = writable(0)
export let AbstractionsSearchSortBy: Writable<string> = writable('last_updated_on')
export let AbstractionsSearchSortByOrder: Writable<string> = writable('desc')
export let AbstractionTimeoutActive: Writable<boolean> = writable(true)
export let AbstractionTimeoutSeconds: Writable<number> = writable(300000)

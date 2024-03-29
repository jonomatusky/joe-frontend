import React, { useEffect, useRef, useState } from 'react'
import {
  Container,
  Grid,
  CircularProgress,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import FabAdd from 'components/FabAdd'
import FuzzySearch from 'fuzzy-search'
import InfiniteScroll from 'react-infinite-scroll-component'
import usePageTitle from 'hooks/use-page-title'
// import LayoutDrawer from 'layouts/LayoutDrawer'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Groups, NoteAdd, Person } from '@mui/icons-material'
import useOrganizationsStore from 'hooks/store/use-organizations-store'
import useContentStore from 'hooks/store/use-content-store'
import useFetchContent from 'hooks/use-fetch-content'
import useUsersStore from 'hooks/store/use-users-store'
import { Box } from '@mui/system'
import Panel from 'layouts/Panel'
import useUserStore from 'hooks/store/use-user-store'
import HeaderViews from 'components/HeaderViews'
import useContentTypesStore from 'hooks/store/use-content-types-store'
import DialogContentCreate from '../ViewContent/components/DialogAbout'
import Loading from 'pages/Loading/Loading'

const ViewContents = () => {
  const { items } = useContentStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const { select: selectUser } = useUsersStore()
  const { select: selectContentType } = useContentTypesStore()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)
  const { item: user } = useUserStore()

  const { select: selectOrganization } = useOrganizationsStore()

  const search = searchParams.get('search') || ''

  const [searchValue, setSearchValue] = useState(search)

  usePageTitle()
  useFetchContent()

  const [chunkCount, setChunkCount] = useState(1)

  const viewAll = searchParams.get('view') === 'all'

  const filtered = [...items].filter(item =>
    !user.id ? false : viewAll ? true : item.owner === user.id
  )

  const sorted = filtered
    .map(item => {
      return {
        ...item,
        owner: selectUser(item.owner)?.email,
        organization: selectOrganization(
          item.organization || item.organizations[0]
        )?.name,
        primaryType: selectContentType(item.type).primary,
        secondaryType: selectContentType(item.type).secondary,
      }
    })
    .filter(item => item.primaryType !== 'Press Release')
    .sort((a, b) => {
      return b.createdAt - a.createdAt
    })

  const searcher = new FuzzySearch(
    sorted,
    ['name', 'title', 'owner', 'organization'],
    {
      sort: true,
    }
  )
  const result = searcher.search(search)

  let list = result

  const chunks = []
  const chunkSize = 25

  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize)
    chunks.push(chunk)
  }

  const itemsOnScreen = []

  chunks.forEach((chunk, index) => {
    if (index < chunkCount) {
      itemsOnScreen.push(...chunk)
    }
  })

  const addMore = () => {
    console.log('adding more')
    setChunkCount(chunkCount + 1)
  }

  const handleUpdateSearch = value => {
    setSearchValue(value)
  }

  useEffect(() => {
    const sv = searchValue

    const timeout = setTimeout(() => {
      const s = searchParams.get('search') || ''
      const va = searchParams.get('view')

      if (sv === searchValue && sv !== s) {
        let params = !!sv && sv !== '' ? [['search', sv]] : []
        if (!!va && va !== '') {
          params = [...params, ['view', va]]
        }
        setSearchParams(new URLSearchParams(params))
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchValue, searchParams, setSearchParams])

  function useOutsideAlerter(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setSelectedId(null)
        }
      }
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [ref])
  }

  const wrapperRef = useRef(null)

  useOutsideAlerter(wrapperRef)

  const handleSetViewAll = value => {
    let params = !!search && search !== '' ? [['search', search]] : []
    if (!!value && value !== '') {
      params = [...params, ['view', 'all']]
    }
    setSearchParams(new URLSearchParams(params))
  }

  return (
    <>
      <FabAdd Icon={NoteAdd} Dialog={DialogContentCreate} />
      <HeaderViews
        searchValue={searchValue}
        setSearchValue={handleUpdateSearch}
      />
      {!user.id && <Loading />}
      {!!user.id && (
        <Container maxWidth="xl">
          <Box width="100%" display="flex" mt={2}>
            <Box
              width="300px"
              pr={2}
              sx={{ display: { xs: 'none', md: 'block' } }}
              position="fixed"
              flexShrink={0}
            >
              <Panel>
                <Box p={2} display="flex">
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        onClick={() => (window.location.hash = '#create')}
                        endIcon={<NoteAdd />}
                        variant="contained"
                        size="large"
                        sx={{ height: '56px' }}
                      >
                        Create New
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <List disablePadding>
                        <ListItem disablePadding sx={{ pb: 1.5 }}>
                          <ListItemButton
                            selected={!viewAll}
                            sx={{
                              minHeight: 48,
                              borderRadius: 1,
                            }}
                            onClick={() => handleSetViewAll(false)}
                          >
                            <ListItemIcon>
                              <Person />
                            </ListItemIcon>
                            <ListItemText primary="Your Content" />
                          </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemButton
                            selected={viewAll}
                            sx={{
                              minHeight: 48,
                              borderRadius: 1,
                            }}
                            onClick={() => handleSetViewAll(true)}
                          >
                            <ListItemIcon>
                              <Groups />
                            </ListItemIcon>
                            <ListItemText primary="All Content" />
                          </ListItemButton>
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </Box>
              </Panel>
            </Box>
            <Box
              width="300px"
              pr={2}
              sx={{ display: { xs: 'none', md: 'block' } }}
              visibility="hidden"
              flexShrink={0}
            />
            <Box flexGrow={1} width="100px">
              <InfiniteScroll
                dataLength={itemsOnScreen.length}
                next={addMore}
                hasMore={itemsOnScreen.length < list.length}
                loader={
                  <Grid container mt={2} mb={2}>
                    <Grid item xs={12} lg={9} textAlign="center">
                      <CircularProgress />
                    </Grid>
                  </Grid>
                }
              >
                <div ref={wrapperRef}>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ width: '100%' }}>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell width="55%">Name</TableCell>
                                <TableCell width="15%">Company</TableCell>
                                <TableCell width="15%">Owner</TableCell>
                                <TableCell width="15%">Edited</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {itemsOnScreen.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={3} align="center">
                                    No results found
                                  </TableCell>
                                </TableRow>
                              )}
                              {itemsOnScreen.length > 0 &&
                                itemsOnScreen.map((item, i) => (
                                  <TableRow
                                    key={i}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      if (selectedId === item.id) {
                                        navigate('/content/' + item.id)
                                      } else {
                                        setSelectedId(item.id)
                                      }
                                    }}
                                    selected={selectedId === item.id}
                                  >
                                    <TableCell
                                      width="55%"
                                      sx={{
                                        maxWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {item.name ||
                                        item.title ||
                                        item.titleInternal ||
                                        'No Title'}
                                    </TableCell>
                                    <TableCell
                                      width="15%"
                                      sx={{
                                        maxWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {item.organization}
                                    </TableCell>
                                    <TableCell
                                      width="15%"
                                      sx={{
                                        maxWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {item.owner}
                                    </TableCell>
                                    <TableCell
                                      width="15%"
                                      sx={{
                                        maxWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {new Date(
                                        item.updatedAt || item.createdAt
                                      ).toLocaleDateString('en-us', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </Grid>
                  </Grid>
                </div>
              </InfiniteScroll>
            </Box>
          </Box>
          {/* </Grid>
        </Grid> */}
        </Container>
      )}
      {/* </LayoutDrawer> */}
    </>
  )
}

export default ViewContents

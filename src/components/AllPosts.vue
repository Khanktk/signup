<script setup lang="ts">
import { ref, onMounted, watch, h } from 'vue'
import axios from 'axios'

import type { ColumnDef, PaginationState } from '@tanstack/vue-table'
import { useVueTable, getCoreRowModel, FlexRender } from '@tanstack/vue-table'
import { MoreHorizontal } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

// table data
interface Post {
  id: number
  title: string
  body: string
}


const posts = ref<Post[]>([])
const loading = ref(false)


const editOpen = ref(false)
const editingPost = ref<Post | null>(null)
const editForm = ref({ title: '', body: '' })

// Pagination 
const pagination = ref<PaginationState>({
  pageIndex: 0,
  pageSize: 3,
})
const pageCount = ref(0)

// messages
const successMessage = ref('')
const errorMessage = ref('')

const resetMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

//API get All posts

const fetchPosts = async (clearMsgs = true) => {
  loading.value = true
  if (clearMsgs) resetMessages() // only clear messages if asked

  try {
    const token = localStorage.getItem('authToken')
    if (!token) throw new Error('Not authenticated')

    const res = await axios.get('http://192.168.18.141:8000/api/posts', {
      params: { page: pagination.value.pageIndex + 1 },
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    })

    const api = res.data.data
    posts.value = api.data
    pageCount.value = api.last_page
    pagination.value.pageSize = api.per_page

  } catch (err: any) {
    posts.value = []

    if (err.response) {
      // server responded with error
      errorMessage.value = err.response.data?.message || 'Failed to load posts from server.'
    } else if (err.request) {
      // request made but no response (network/server down)
      errorMessage.value = err.message || 'Cannot connect to server. Check network or server.'
    } else {
      // something else
      errorMessage.value = err.message || 'Unexpected error occurred.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPosts())
watch(() => pagination.value.pageIndex, () => fetchPosts())

//edit

const editPost = (post: Post) => {
  editingPost.value = post
  editForm.value = { title: post.title, body: post.body }
  editOpen.value = true
}

const showSuccessMessage = (msg: string) => {
  successMessage.value = msg
  errorMessage.value = ''
  setTimeout(() => {
    successMessage.value = ''
  }, 3000) // disappear after 3 seconds
}

const updatePost = async () => {
  if (!editingPost.value) return

  resetMessages()

  try {
    const token = localStorage.getItem('authToken')
    if (!token) throw new Error('Not authenticated')

    await axios.put(
      `http://192.168.18.141:8000/api/posts/${editingPost.value.id}`,
      editForm.value,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    editOpen.value = false
    editingPost.value = null
    await fetchPosts(false)
    showSuccessMessage('Post updated successfully') // auto-clear after 3s
  } catch (err: any) {
    if (err.response) {
      errorMessage.value = err.response.data?.message || 'Failed to update post'
    } else if (err.request) {
      errorMessage.value = err.message || 'Cannot connect to server.'
    } else {
      errorMessage.value = err.message || 'Unexpected error occurred.'
    }
  }
}

const deletePost = async (id: number) => {
  resetMessages()

  try {
    const token = localStorage.getItem('authToken')
    if (!token) throw new Error('Not authenticated')

    await axios.delete(
      `http://192.168.18.141:8000/api/posts/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    await fetchPosts(false)
    showSuccessMessage('Post deleted successfully') // auto-clear after 3s
  } catch (err: any) {
    if (err.response) {
      errorMessage.value = err.response.data?.message || 'Failed to delete post'
    } else if (err.request) {
      errorMessage.value = err.message || 'Cannot connect to server.'
    } else {
      errorMessage.value = err.message || 'Unexpected error occurred.'
    }
  }
}


// table

const columns: ColumnDef<Post>[] = [
  {
    id: 'serial',
    header: 'S/No',
    cell: ({ row }) => pagination.value.pageIndex * pagination.value.pageSize + row.index + 1,
  },
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'title', header: 'Post Title' },
  {
    accessorKey: 'body',
    header: 'Post Body',
    cell: ({ row }) => h('div', { class: 'max-w-lg truncate text-muted-foreground' }, row.getValue('body')),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => {
      const post = row.original
      return h(AlertDialog, {}, () => [
        h(DropdownMenu, {}, () => [
          h(DropdownMenuTrigger, { asChild: true }, () =>
            h(Button, { variant: 'ghost', size: 'icon' }, () =>
              h(MoreHorizontal, { class: 'h-4 w-4' })
            )
          ),
          h(DropdownMenuContent, { align: 'end' }, () => [
            h(DropdownMenuItem, { onClick: () => editPost(post) }, () => 'Edit'),
            h(AlertDialogTrigger, { asChild: true }, () =>
              h(DropdownMenuItem, { class: 'text-red-600' }, () => 'Delete')
            ),
          ]),
        ]),
        h(AlertDialogContent, {}, () => [
          h(AlertDialogHeader, {}, () => [
            h(AlertDialogTitle, {}, () => 'Delete post'),
            h(AlertDialogDescription, {}, () => 'This action cannot be undone.'),
          ]),
          h(AlertDialogFooter, {}, () => [
            h(AlertDialogCancel, {}, () => 'Cancel'),
            h(AlertDialogAction, {
              class: 'bg-red-600 hover:bg-red-700',
              onClick: () => deletePost(post.id),
            }, () => 'Delete'),
          ]),
        ]),
      ])
    },
  },
]

/* =============================
   TABLE INSTANCE
============================= */
const table = useVueTable({
  data: posts,
  columns,
  manualPagination: true,
  state: {
    get pagination() { return pagination.value },
    get pageCount() { return pageCount.value },
  },
  onPaginationChange: updater => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
  <div class="w-full rounded-xl border bg-white p-4">

    <!-- TABLE -->
    <div class="rounded-md border">
      <Table>
        <TableHeader class="bg-gray-100">
          <TableRow v-for="hg in table.getHeaderGroups()" :key="hg.id">
            <TableHead v-for="h in hg.headers" :key="h.id" class="font-semibold text-gray-700">
              <FlexRender v-if="!h.isPlaceholder" :render="h.column.columnDef.header" :props="h.getContext()" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell :colspan="columns.length" class="text-center">Loading...</TableCell>
          </TableRow>
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- STATUS MESSAGES -->
    <div class="mt-4 text-center">
      <p v-if="successMessage" class="text-sm font-medium text-green-600">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-sm font-medium text-red-600">{{ errorMessage }}</p>
    </div>

    <!-- PAGINATION -->
    <div class="flex items-center justify-between py-4">
      <span class="text-sm text-muted-foreground">Page {{ pagination.pageIndex + 1 }} of {{ pageCount }}</span>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="pagination.pageIndex === 0" @click="table.previousPage()">Previous</Button>
        <Button variant="outline" size="sm" :disabled="pagination.pageIndex + 1 >= pageCount" @click="table.nextPage()">Next</Button>
      </div>
    </div>

  </div>

  <!-- EDIT MODAL -->
  <AlertDialog v-model:open="editOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Edit Post</AlertDialogTitle>
      </AlertDialogHeader>

      <div class="space-y-4 py-4">
        <Input v-model="editForm.title" placeholder="Post Title" />
        <textarea v-model="editForm.body" class="w-full rounded-md border p-2 text-sm" rows="4" placeholder="Post Body" />
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel @click="editOpen = false">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="updatePost">Save</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

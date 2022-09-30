<template>
  <div class="mod-config">
    <el-table
      v-loading="dataListLoading"
      :data="dataList"
      border
      style="width: 100%;"
      @selection-change="selectionChangeHandle"
    >
      <el-table-column align="center" header-align="center" type="selection" width="50"></el-table-column>
      <el-table-column align="center" header-align="center" label="id" prop="id"></el-table-column>
      <el-table-column align="center" header-align="center" label="名称" prop="spuName"></el-table-column>
      <el-table-column align="center" header-align="center" label="描述" prop="spuDescription"></el-table-column>
      <el-table-column align="center" header-align="center" label="分类" prop="catalogId"></el-table-column>
      <el-table-column align="center" header-align="center" label="品牌" prop="brandId"></el-table-column>
      <el-table-column align="center" header-align="center" label="重量" prop="weight"></el-table-column>
      <el-table-column align="center" header-align="center" label="上架状态" prop="publishStatus">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.publishStatus == 0">新建</el-tag>
          <el-tag v-if="scope.row.publishStatus == 1">已上架</el-tag>
          <el-tag v-if="scope.row.publishStatus == 2">已下架</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" header-align="center" label="创建时间" prop="createTime"></el-table-column>
      <el-table-column align="center" header-align="center" label="修改时间" prop="updateTime"></el-table-column>
      <el-table-column align="center" fixed="right" header-align="center" label="操作" width="150">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.publishStatus == 0"
            size="small"
            type="text"
            @click="productUp(scope.row.id)"
          >上架
          </el-button>
          <el-button size="small" type="text" @click="attrUpdateShow(scope.row)">规格</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="pageIndex"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
    ></el-pagination>
  </div>
</template>

<script>
import PubSub from 'pubsub-js'

export default {
  data () {
    return {
      dataSub: null,
      dataForm: {},
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      dataListSelections: [],
      addOrUpdateVisible: false
    }
  },
  props: {
    catId: {
      type: Number,
      default: 0
    }
  },
  components: {},
  activated () {
    this.getDataList()
  },
  methods: {
    productUp (id) {
      this.$http({
        url: this.$http.adornUrl('/product/spuinfo/' + id + '/up'),
        method: 'post'
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.$message({
            message: '操作成功',
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.getDataList()
            }
          })
        } else {
          this.$message.error(data.msg)
        }
      })
    },
    attrUpdateShow (row) {
      console.log(row)
      this.$router.push({
        path: '/product-attrupdate',
        query: {spuId: row.id, catalogId: row.catalogId}
      })
    },

    getDataList () {
      this.dataListLoading = true
      let param = {}
      Object.assign(param, this.dataForm, {
        page: this.pageIndex,
        limit: this.pageSize
      })
      this.$http({
        url: this.$http.adornUrl('/product/spuinfo/list'),
        method: 'get',
        params: this.$http.adornParams(param)
      }).then(({data}) => {
        if (data && data.code === 0) {
          this.dataList = data.page.list
          this.totalPage = data.page.totalCount
        } else {
          this.dataList = []
          this.totalPage = 0
        }
        this.dataListLoading = false
      })
    },

    sizeChangeHandle (val) {
      this.pageSize = val
      this.pageIndex = 1
      this.getDataList()
    },

    currentChangeHandle (val) {
      this.pageIndex = val
      this.getDataList()
    },

    selectionChangeHandle (val) {
      this.dataListSelections = val
    },

    addOrUpdateHandle (id) {
    }
  },
  mounted () {
    this.dataSub = PubSub.subscribe('dataForm', (msg, val) => {
      console.log('~~~~~', val)
      this.dataForm = val
      this.getDataList()
    })
  },
  beforeDestroy () {
    PubSub.unsubscribe(this.dataSub)
  }
}
</script>

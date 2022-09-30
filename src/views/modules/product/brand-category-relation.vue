<template>
  <div>
    <el-dialog :close-on-click-modal="false" :visible.sync="visible" @closed="dialogClose">
      <el-dialog :visible.sync="innerVisible" append-to-body title="选择属性" width="40%">
        <div>
          <category-cascader :catelog-path.sync="catelogPath"></category-cascader>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAddRealtion">确认新增</el-button>
        </div>
      </el-dialog>
      <el-row>
        <el-col :span="24">
          <el-button type="primary" @click="addRelation">新建关联</el-button>
          <el-button
            :disabled="dataListSelections.length <= 0"
            type="danger"
            @click="batchDeleteRelation"
          >批量删除
          </el-button>
          <!--  -->
          <el-table
            :data="relationBrands"
            border
            style="width: 100%"
            @selection-change="selectionChangeHandle"
          >
            <el-table-column align="center" header-align="center" type="selection" width="50"></el-table-column>
            <el-table-column label="id" prop="id"></el-table-column>
            <el-table-column label="品牌名" prop="brandName"></el-table-column>
            <el-table-column label="类别名" prop="catelogName">
            </el-table-column>
            <el-table-column align="center" fixed="right" header-align="center" label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="text" @click="relationRemove(scope.row.id)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>
<script>
import CategoryCascader from '../common/category-cascader'

export default {

  components: {CategoryCascader},
  props: {},
  data () {
    return {
      catelogPath: [],
      bid: 0,
      visible: false,
      innerVisible: false,
      relationBrands: [],
      dataListSelections: [],
      dataForm: {
        key: ''
      },
      dataList: [],
      pageIndex: 1,
      pageSize: 10,
      totalPage: 0,
      dataListLoading: false,
      innerdataListSelections: []
    }
  },
  methods: {
    selectionChangeHandle (val) {
      this.dataListSelections = val
    },
    innerSelectionChangeHandle (val) {
      this.innerdataListSelections = val
    },
    addRelation () {
      this.getDataList()
      this.innerVisible = true
    },
    batchDeleteRelation () {
      let postData = []
      console.log(this.dataListSelections)
      this.dataListSelections.forEach(item => {
        postData.push(item.id)
      })
      this.$http({
        url: this.$http.adornUrl('/product/categorybrandrelation/delete'),
        method: 'DELETE',
        data: this.$http.adornData(postData, false)
      }).then(({data}) => {
        if (data.code === 0) {
          this.$message({type: 'success', message: '删除成功'})
          this.init(this.bid)
        } else {
          this.$message({type: 'error', message: data.msg})
        }
      })
    },
    relationRemove (relationId) {
      let data = []
      data.push(relationId)
      this.$http({
        url: this.$http.adornUrl('/product/categorybrandrelation/delete'),
        method: 'DELETE',
        data: this.$http.adornData(data, false)
      }).then(({data}) => {
        if (data.code === 0) {
          this.$message({type: 'success', message: '删除成功'})
          this.init(this.bid)
        } else {
          this.$message({type: 'error', message: data.msg})
        }
      })
    },
    submitAddRealtion () {
      this.innerVisible = false
      this.$http({
        url: this.$http.adornUrl('/product/categorybrandrelation/save'),
        method: 'post',
        data: this.$http.adornData({
          'brandId': this.bid,
          'catelogId': this.catelogPath.pop()
        }, false)
      }).then(({data}) => {
        if (data.code === 0) {
          this.$message({type: 'success', message: '新增关联成功'})
        }
        this.$emit('refreshData')
        this.init(this.bid)
      })
    },
    init (id) {
      this.bid = id || 0
      this.visible = true
      this.$http({
        url: this.$http.adornUrl(`/product/categorybrandrelation/list/${this.bid}`),
        method: 'get'
      }).then(({data}) => {
        this.relationBrands = data.page.list
      })
    },
    dialogClose () {
    },

    getDataList () {
      this.dataListLoading = true
      this.$http({
        url: this.$http.adornUrl(
          `/product/categorybrandrelation/list/${this.bid}`
        ),
        method: 'get',
        params: this.$http.adornParams({
          page: this.pageIndex,
          limit: this.pageSize,
          key: this.dataForm.key
        })
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
    }
  }
}
</script>
<style scoped>
</style>

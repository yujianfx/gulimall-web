<template>
  <div>
    <el-row>
      <el-col :span="24">
        <el-steps :active="step" finish-status="success">
          <el-step title="基本信息"></el-step>
          <el-step title="规格参数"></el-step>
          <el-step title="销售属性"></el-step>
          <el-step title="SKU信息"></el-step>
          <el-step title="保存完成"></el-step>
        </el-steps>
      </el-col>
      <el-col v-show="step==0" :span="24">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-form ref="spuBaseForm" :model="spu" :rules="spuBaseInfoRules" label-width="120px">
            <el-form-item label="商品名称" prop="spuName">
              <el-input v-model="spu.spuName"></el-input>
            </el-form-item>
            <el-form-item label="商品描述" prop="spuDescription">
              <el-input v-model="spu.spuDescription"></el-input>
            </el-form-item>
            <el-form-item label="选择分类" prop="catalogId">
              <category-cascader></category-cascader>
            </el-form-item>
            <el-form-item label="选择品牌" prop="brandId">
              <brand-select></brand-select>
            </el-form-item>
            <el-form-item label="商品重量(Kg)" prop="weight">
              <el-input-number v-model.number="spu.weight" :min="0" :precision="3" :step="0.1"></el-input-number>
            </el-form-item>
            <el-form-item label="设置积分" prop="bounds">
              <label>金币</label>
              <el-input-number
                v-model="spu.bounds.buyBounds"
                :min="0"
                controls-position="right"
                placeholder="金币"
                style="width:130px"
              ></el-input-number>
              <label style="margin-left:15px">成长值</label>
              <el-input-number
                v-model="spu.bounds.growBounds"
                :min="0"
                controls-position="right"
                placeholder="成长值"
                style="width:130px"
              >
                <template slot="prepend">成长值</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="商品介绍" prop="decript">
              <multi-upload v-model="spu.decript"></multi-upload>
            </el-form-item>

            <el-form-item label="商品图集" prop="images">
              <multi-upload v-model="spu.images"></multi-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="success" @click="collectSpuBaseInfo">下一步：设置基本参数</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col v-show="step==1" :span="24">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-tabs style="width:98%" tab-position="left">
            <el-tab-pane
              v-for="(group,gidx) in dataResp.attrGroups"
              :key="group.attrGroupId"
              :label="group.attrGroupName"
            >
              <!-- 遍历属性,每个tab-pane对应一个表单，每个属性是一个表单项  spu.baseAttrs[0] = [{attrId:xx,val:}]-->
              <el-form ref="form" :model="spu">
                <el-form-item
                  v-for="(attr,aidx) in group.attrs"
                  :key="attr.attrId"
                  :label="attr.attrName"
                >
                  <el-input
                    v-show="false"
                    v-model="dataResp.baseAttrs[gidx][aidx].attrId"
                    type="hidden"
                  ></el-input>
                  <el-select
                    v-model="dataResp.baseAttrs[gidx][aidx].attrValues"
                    :multiple="attr.valueType == 1"
                    allow-create
                    default-first-option
                    filterable
                    placeholder="请选择或输入值"
                  >
                    <el-option
                      v-for="(val,vidx) in attr.valueSelect.split(';')"
                      :key="vidx"
                      :label="val"
                      :value="val"
                    ></el-option>
                  </el-select>
                  <el-checkbox
                    v-model="dataResp.baseAttrs[gidx][aidx].showDesc"
                    :false-label="0"
                    :true-label="1"
                  >快速展示
                  </el-checkbox>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
          <div style="margin:auto">
            <el-button type="primary" @click="step = 0">上一步</el-button>
            <el-button type="success" @click="generateSaleAttrs">下一步：设置销售属性</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col v-show="step==2" :span="24">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>选择销售属性</span>
              <el-form ref="saleform" :model="spu">
                <el-form-item
                  v-for="(attr,aidx) in dataResp.saleAttrs"
                  :key="attr.attrId"
                  :label="attr.attrName"
                >
                  <el-input
                    v-show="false"
                    v-model="dataResp.tempSaleAttrs[aidx].attrId"
                    type="hidden"
                  ></el-input>
                  <el-checkbox-group v-model="dataResp.tempSaleAttrs[aidx].attrValues">
                    <el-checkbox
                      v-for="val in dataResp.saleAttrs[aidx].valueSelect.split(';')"
                      v-if="dataResp.saleAttrs[aidx].valueSelect != ''"
                      :key="val"
                      :label="val"
                    ></el-checkbox>
                    <div style="margin-left:20px;display:inline">
                      <el-button
                        v-show="!inputVisible[aidx].view"
                        class="button-new-tag"
                        size="mini"
                        @click="showInput(aidx)"
                      >+自定义
                      </el-button>
                      <el-input
                        v-show="inputVisible[aidx].view"
                        :ref="'saveTagInput'+aidx"
                        v-model="inputValue[aidx].val"
                        size="mini"
                        style="width:150px"
                        @blur="handleInputConfirm(aidx)"
                        @keyup.enter.native="handleInputConfirm(aidx)"
                      ></el-input>
                    </div>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>
            <el-button type="primary" @click="step = 1">上一步</el-button>
            <el-button type="success" @click="generateSkus">下一步：设置SKU信息</el-button>
          </el-card>
        </el-card>
      </el-col>
      <el-col v-show="step==3" :span="24">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <el-table :data="spu.skus" style="width: 100%">
            <el-table-column label="属性组合">
              <el-table-column
                v-for="(item,index) in dataResp.tableAttrColumn"
                :key="item.attrId"
                :label="item.attrName"
              >
                <template slot-scope="scope">
                  <span style="margin-left: 10px">{{ scope.row.attr[index].attrValue }}</span>
                </template>
              </el-table-column>
            </el-table-column>
            <el-table-column label="商品名称" prop="skuName">
              <template slot-scope="scope">
                <el-input v-model="scope.row.skuName"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="标题" prop="skuTitle">
              <template slot-scope="scope">
                <el-input v-model="scope.row.skuTitle"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="副标题" prop="skuSubtitle">
              <template slot-scope="scope">
                <el-input v-model="scope.row.skuSubtitle"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="价格" prop="price">
              <template slot-scope="scope">
                <el-input v-model="scope.row.price"></el-input>
              </template>
            </el-table-column>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row>
                  <el-col :span="24">
                    <label style="display:block;float:left">选择图集 或</label>
                    <multi-upload
                      v-model="uploadImages"
                      :listType="'text'"
                      :showFile="false"
                      style="float:left;margin-left:10px;"
                    ></multi-upload>
                  </el-col>
                  <el-col :span="24">
                    <el-divider></el-divider>
                  </el-col>
                  <el-col :span="24">
                    <el-card
                      v-for="(img,index) in spu.images"
                      :key="index"
                      :body-style="{ padding: '0px' }"
                      style="width:170px;float:left;margin-left:15px;margin-top:15px;"
                    >
                      <img :src="img" style="width:160px;height:120px"/>
                      <div style="padding: 14px;">
                        <el-row>
                          <el-col :span="12">
                            <el-checkbox
                              v-model="scope.row.images[index].imgUrl"
                              :true-label="img"
                              false-label
                            ></el-checkbox>
                          </el-col>
                          <el-col :span="12">
                            <el-tag v-if="scope.row.images[index].defaultImg == 1">
                              <input
                                :name="scope.row.skuName"
                                checked
                                type="radio"
                                @change="checkDefaultImg(scope.row,index,img)"
                              />设为默认
                            </el-tag>
                            <el-tag v-else>
                              <input
                                :name="scope.row.skuName"
                                type="radio"
                                @change="checkDefaultImg(scope.row,index,img)"
                              />设为默认
                            </el-tag>
                          </el-col>
                        </el-row>
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
                <!-- 折扣，满减，会员价 -->
                <el-form :model="scope.row">
                  <el-row>
                    <el-col :span="24">
                      <el-form-item label="设置折扣">
                        <label>满</label>
                        <el-input-number
                          v-model="scope.row.fullCount"
                          :min="0"
                          controls-position="right"
                          style="width:160px"
                        ></el-input-number>
                        <label>件</label>

                        <label style="margin-left:15px;">打</label>
                        <el-input-number
                          v-model="scope.row.discount"
                          :max="1"
                          :min="0"
                          :precision="2"
                          :step="0.01"
                          controls-position="right"
                          style="width:160px"
                        ></el-input-number>
                        <label>折</label>
                        <el-checkbox
                          v-model="scope.row.countStatus"
                          :false-label="0"
                          :true-label="1"
                        >可叠加优惠
                        </el-checkbox>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24">
                      <el-form-item label="设置满减">
                        <label>满</label>
                        <el-input-number
                          v-model="scope.row.fullPrice"
                          :min="0"
                          :step="100"
                          controls-position="right"
                          style="width:160px"
                        ></el-input-number>
                        <label>元</label>
                        <label style="margin-left:15px;">减</label>
                        <el-input-number
                          v-model="scope.row.reducePrice"
                          :min="0"
                          :step="10"
                          controls-position="right"
                          style="width:160px"
                        ></el-input-number>
                        <label>元</label>
                        <el-checkbox
                          v-model="scope.row.priceStatus"
                          :false-label="0"
                          :true-label="1"
                        >可叠加优惠
                        </el-checkbox>
                      </el-form-item>
                    </el-col>

                    <el-col :span="24">
                      <el-form-item v-if="scope.row.memberPrice.length>0" label="设置会员价">
                        <br/>
                        <!--   @change="handlePriceChange(scope,mpidx,$event)" -->
                        <el-form-item v-for="(mp,mpidx) in scope.row.memberPrice" :key="mp.id">
                          {{ mp.name }}
                          <el-input-number
                            v-model="scope.row.memberPrice[mpidx].price"
                            :min="0"
                            :precision="2"
                            controls-position="right"
                            style="width:160px"
                          ></el-input-number>
                        </el-form-item>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" @click="step = 2">上一步</el-button>
          <el-button type="success" @click="submitSkus">下一步：保存商品信息</el-button>
        </el-card>
      </el-col>
      <el-col v-show="step==4" :span="24">
        <el-card class="box-card" style="width:80%;margin:20px auto">
          <h1>保存成功</h1>
          <el-button type="primary" @click="addAgian">继续添加</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>


import CategoryCascader from '../common/category-cascader'
import BrandSelect from '../common/brand-select'
import MultiUpload from '@/components/upload/multiUpload'

export default {

  components: {CategoryCascader, BrandSelect, MultiUpload},
  props: {},
  data () {
    return {
      catPathSub: null,
      brandIdSub: null,
      uploadDialogVisible: false,
      uploadImages: [],
      step: 0,

      spu: {

        spuName: '',
        spuDescription: '',
        catalogId: 0,
        brandId: '',
        weight: '',
        publishStatus: 0,
        decript: [],
        images: [],
        bounds: {

          buyBounds: 0,
          growBounds: 0
        },
        baseAttrs: [],
        skus: []
      },
      spuBaseInfoRules: {
        spuName: [
          {required: true, message: '请输入商品名字', trigger: 'blur'}
        ],
        spuDescription: [
          {required: true, message: '请编写一个简单描述', trigger: 'blur'}
        ],
        catalogId: [
          {required: true, message: '请选择一个分类', trigger: 'blur'}
        ],
        brandId: [
          {required: true, message: '请选择一个品牌', trigger: 'blur'}
        ],
        decript: [
          {required: true, message: '请上传商品详情图集', trigger: 'blur'}
        ],
        images: [
          {required: true, message: '请上传商品图片集', trigger: 'blur'}
        ],
        weight: [
          {
            type: 'number',
            required: true,
            message: '请填写正确的重量值',
            trigger: 'blur'
          }
        ]
      },
      dataResp: {

        attrGroups: [],
        baseAttrs: [],
        saleAttrs: [],
        tempSaleAttrs: [],
        tableAttrColumn: [],
        memberLevels: [],
        steped: [false, false, false, false, false]
      },
      inputVisible: [],
      inputValue: []
    }
  },

  computed: {},

  watch: {
    uploadImages (val) {

      let imgArr = Array.from(new Set(this.spu.images.concat(val)))



      this.spu.skus.forEach((item, index) => {
        let len = imgArr.length - this.spu.skus[index].images.length
        if (len > 0) {
          let imgs = new Array(len)
          imgs = imgs.fill({imgUrl: '', defaultImg: 0})
          this.spu.skus[index].images = item.images.concat(imgs)
        }
      })

      this.spu.images = imgArr
      console.log('this.spu.skus', this.spu.skus)
    }
  },

  methods: {
    addAgian () {
      this.step = 0
      this.resetSpuData()
    },
    resetSpuData () {
      this.spu = {
        spuName: '',
        spuDescription: '',
        catalogId: 0,
        brandId: '',
        weight: '',
        publishStatus: 0,
        decript: [],
        images: [],
        bounds: {
          buyBounds: 0,
          growBounds: 0
        },
        baseAttrs: [],
        skus: []
      }
    },
    handlePriceChange (scope, mpidx, e) {
      this.spu.skus[scope.$index].memberPrice[mpidx].price = e
    },
    getMemberLevels () {
      this.$http({
        url: this.$http.adornUrl('/member/memberlevel/list'),
        method: 'get',
        params: this.$http.adornParams({
          page: 1,
          limit: 500
        })
      })
        .then(({data}) => {
          this.dataResp.memberLevels = data.page.list
        })
        .catch(e => {
          console.log(e)
        })
    },
    showInput (idx) {
      console.log('``````', this.view)
      this.inputVisible[idx].view = true

    },
    checkDefaultImg (row, index, img) {
      console.log('默认图片', row, index)

      row.images[index].imgUrl = img
      row.images[index].defaultImg = 1

      row.images.forEach((item, idx) => {
        if (idx != index) {
          row.images[idx].defaultImg = 0
        }
      })
    },
    handleInputConfirm (idx) {
      let inputValue = this.inputValue[idx].val
      if (inputValue) {

        if (this.dataResp.saleAttrs[idx].valueSelect == '') {
          this.dataResp.saleAttrs[idx].valueSelect = inputValue
        } else {
          this.dataResp.saleAttrs[idx].valueSelect += ';' + inputValue
        }
      }
      this.inputVisible[idx].view = false
      this.inputValue[idx].val = ''
    },
    collectSpuBaseInfo () {

      this.$refs.spuBaseForm.validate(valid => {
        if (valid) {
          this.step = 1
          this.showBaseAttrs()
        } else {
          return false
        }
      })
    },
    generateSaleAttrs () {

      this.spu.baseAttrs = []
      this.dataResp.baseAttrs.forEach(item => {
        item.forEach(attr => {
          let {attrId, attrValues, showDesc} = attr

          if (attrValues != '') {
            if (attrValues instanceof Array) {

              attrValues = attrValues.join(';')
            }
            this.spu.baseAttrs.push({attrId, attrValues, showDesc})
          }
        })
      })
      console.log('baseAttrs', this.spu.baseAttrs)
      this.step = 2
      this.getShowSaleAttr()
    },
    generateSkus () {
      this.step = 3


      let selectValues = []
      this.dataResp.tableAttrColumn = []
      this.dataResp.tempSaleAttrs.forEach(item => {
        if (item.attrValues.length > 0) {
          selectValues.push(item.attrValues)
          this.dataResp.tableAttrColumn.push(item)
        }
      })

      let descartes = this.descartes(selectValues)



      console.log('生成的组合', JSON.stringify(descartes))

      let skus = []

      descartes.forEach((descar, descaridx) => {
        let attrArray = []
        descar.forEach((de, index) => {

          let saleAttrItem = {
            attrId: this.dataResp.tableAttrColumn[index].attrId,
            attrName: this.dataResp.tableAttrColumn[index].attrName,
            attrValue: de
          }
          attrArray.push(saleAttrItem)
        })

        let imgs = []
        this.spu.images.forEach((img, idx) => {
          imgs.push({imgUrl: '', defaultImg: 0})
        })


        let memberPrices = []
        if (this.dataResp.memberLevels.length > 0) {
          for (let i = 0; i < this.dataResp.memberLevels.length; i++) {
            if (this.dataResp.memberLevels[i].priviledgeMemberPrice == 1) {
              memberPrices.push({
                id: this.dataResp.memberLevels[i].id,
                name: this.dataResp.memberLevels[i].name,
                price: 0
              })
            }
          }
        }

        let res = this.hasAndReturnSku(this.spu.skus, descar)
        if (res === null) {
          skus.push({
            attr: attrArray,
            skuName: this.spu.spuName + ' ' + descar.join(' '),
            price: 0,
            skuTitle: this.spu.spuName + ' ' + descar.join(' '),
            skuSubtitle: '',
            images: imgs,
            descar: descar,
            fullCount: 0,
            discount: 0,
            countStatus: 0,
            fullPrice: 0.0,
            reducePrice: 0.0,
            priceStatus: 0,
            memberPrice: [].concat(memberPrices)
          })
        } else {
          skus.push(res)
        }
      })
      this.spu.skus = skus
      console.log('结果!!!', this.spu.skus, this.dataResp.tableAttrColumn)
    },

    hasAndReturnSku (skus, descar) {
      let res = null
      if (skus.length > 0) {
        for (let i = 0; i < skus.length; i++) {
          if (skus[i].descar.join(' ') == descar.join(' ')) {
            res = skus[i]
          }
        }
      }
      return res
    },
    getShowSaleAttr () {

      if (!this.dataResp.steped[1]) {
        this.$http({
          url: this.$http.adornUrl(
            `/product/attr/sale/list/${this.spu.catalogId}`
          ),
          method: 'get',
          params: this.$http.adornParams({
            page: 1,
            limit: 500
          })
        }).then(({data}) => {
          this.dataResp.saleAttrs = data.page.list
          data.page.list.forEach(item => {
            this.dataResp.tempSaleAttrs.push({
              attrId: item.attrId,
              attrValues: [],
              attrName: item.attrName
            })
            this.inputVisible.push({view: false})
            this.inputValue.push({val: ''})
          })
          this.dataResp.steped[1] = true
        })
      }
    },
    showBaseAttrs () {
      if (!this.dataResp.steped[0]) {
        this.$http({
          url: this.$http.adornUrl(
            `/product/attrgroup/${this.spu.catalogId}/withattr`
          ),
          method: 'get',
          params: this.$http.adornParams({})
        }).then(({data}) => {

          data.data.forEach(item => {
            let attrArray = []
            item.attrs.forEach(attr => {
              attrArray.push({
                attrId: attr.attrId,
                attrValues: '',
                showDesc: attr.showDesc
              })
            })
            this.dataResp.baseAttrs.push(attrArray)
          })
          this.dataResp.steped[0] = 0
          this.dataResp.attrGroups = data.data
        })
      }
    },

    submitSkus () {
      console.log('~~~~~', JSON.stringify(this.spu))
      this.$confirm('将要提交商品数据，需要一小段时间，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http({
            url: this.$http.adornUrl('/product/spuinfo/save'),
            method: 'post',
            data: this.$http.adornData(this.spu, false)
          }).then(({data}) => {
            if (data.code == 0) {
              this.$message({
                type: 'success',
                message: '新增商品成功!'
              })
              this.step = 4
            } else {
              this.$message({
                type: 'error',
                message: '保存失败，原因【' + data.msg + '】'
              })
            }
          })
        })
        .catch(e => {
          console.log(e)
          this.$message({
            type: 'info',
            message: '已取消'
          })
        })
    },

    descartes (list) {

      var point = {}

      var result = []
      var pIndex = null
      var tempCount = 0
      var temp = []


      for (var index in list) {
        if (typeof list[index] == 'object') {
          point[index] = {parent: pIndex, count: 0}
          pIndex = index
        }
      }


      if (pIndex == null) {
        return list
      }


      while (true) {
        for (var index in list) {
          tempCount = point[index]['count']
          temp.push(list[index][tempCount])
        }


        result.push(temp)
        temp = []


        while (true) {
          if (point[index]['count'] + 1 >= list[index].length) {
            point[index]['count'] = 0
            pIndex = point[index]['parent']
            if (pIndex == null) {
              return result
            }


            index = pIndex
          } else {
            point[index]['count']++
            break
          }
        }
      }
    }
  },

  created () {
  },

  mounted () {
    this.catPathSub = PubSub.subscribe('catPath', (msg, val) => {
      this.spu.catalogId = val[val.length - 1]
    })
    this.brandIdSub = PubSub.subscribe('brandId', (msg, val) => {
      this.spu.brandId = val
    })
    this.getMemberLevels()
  },
  beforeCreate () {
  },
  beforeMount () {
  },
  beforeUpdate () {
  },
  updated () {
  },
  beforeDestroy () {
    PubSub.unsubscribe(this.catPathSub)
    PubSub.unsubscribe(this.brandIdSub)
  },
  destroyed () {
  },
  activated () {
  }
}
</script>
<style scoped>
</style>

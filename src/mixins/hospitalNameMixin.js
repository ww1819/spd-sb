/**
 * 医院名称 Mixin
 * 用于打印组件获取医院名称；租户用户用 getConfigKey，平台用户用 listConfig
 */
import { listConfig, getConfigKey } from '@/api/system/config'

// 缓存键名
const HOSPITAL_NAME_CACHE_KEY = 'hospital_name_cache'
const HOSPITAL_NAME_CACHE_TIME_KEY = 'hospital_name_cache_time'
const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000 // 24小时缓存

export default {
  data() {
    return {
      hospitalName: '', // 医院名称
      hospitalNameLoading: false, // 医院名称加载中
      hospitalNamePromise: null // 医院名称加载Promise
    }
  },
  created() {
    // 立即获取医院名称参数（同步从缓存或异步从API）
    this.getHospitalName()
  },
  watch: {
    // 监听row变化，确保数据加载后再获取医院名称
    row: {
      handler() {
        if (this.row && !this.hospitalName && !this.hospitalNameLoading) {
          this.getHospitalName()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 从缓存获取医院名称
    getHospitalNameFromCache() {
      try {
        const cachedName = localStorage.getItem(HOSPITAL_NAME_CACHE_KEY)
        const cacheTime = localStorage.getItem(HOSPITAL_NAME_CACHE_TIME_KEY)
        
        if (cachedName && cacheTime) {
          const now = Date.now()
          const cachedAt = parseInt(cacheTime, 10)
          
          // 如果缓存未过期，直接使用
          if (now - cachedAt < CACHE_EXPIRE_TIME) {
            return cachedName
          }
        }
      } catch (e) {
        console.error('读取医院名称缓存失败:', e)
      }
      return null
    },
    
    // 保存医院名称到缓存
    saveHospitalNameToCache(name) {
      try {
        localStorage.setItem(HOSPITAL_NAME_CACHE_KEY, name)
        localStorage.setItem(HOSPITAL_NAME_CACHE_TIME_KEY, Date.now().toString())
      } catch (e) {
        console.error('保存医院名称缓存失败:', e)
      }
    },
    
    // 获取医院名称（通过参数名称"医院名称"查询参数键值）；租户用户不访问 listConfig，改用 getConfigKey 或留空
    getHospitalName() {
      if (this.hospitalNameLoading && this.hospitalNamePromise) {
        return this.hospitalNamePromise
      }
      const cachedName = this.getHospitalNameFromCache()
      if (cachedName) {
        this.hospitalName = cachedName
        return Promise.resolve(cachedName)
      }
      if (this.hospitalName) {
        return Promise.resolve(this.hospitalName)
      }
      // 租户用户不调用 listConfig（无权限），改用 getConfigKey 按 key 读取
      const isTenant = this.$store && this.$store.getters && this.$store.getters.customerId
      if (isTenant) {
        this.hospitalNameLoading = true
        this.hospitalNamePromise = getConfigKey('sys.hospital.name').then(res => {
          const name = (res && res.msg) ? String(res.msg) : ''
          this.hospitalName = name
          if (name) this.saveHospitalNameToCache(name)
          return name
        }).catch(() => '').finally(() => {
          this.hospitalNameLoading = false
          this.hospitalNamePromise = null
        })
        return this.hospitalNamePromise
      }
      this.hospitalNameLoading = true
      this.hospitalNamePromise = listConfig({}).then(response => {
        let configList = []
        if (response && response.rows) {
          configList = response.rows
        } else if (Array.isArray(response)) {
          configList = response
        } else if (response && response.data && response.data.rows) {
          configList = response.data.rows
        }
        
        if (configList && configList.length > 0) {
          // 查找参数名称为"医院名称"的配置
          const hospitalConfig = configList.find(item => {
            const configName = item.configName || item.config_name || ''
            return configName === '医院名称' || configName.includes('医院名称')
          })
          
          if (hospitalConfig) {
            const name = hospitalConfig.configValue || hospitalConfig.config_value || ''
            this.hospitalName = name
            // 保存到缓存
            if (name) {
              this.saveHospitalNameToCache(name)
            }
            return name
          }
        }
        return ''
      }).catch(error => {
        console.error('获取医院名称失败:', error)
        // 查询失败，保持为空
        this.hospitalName = ''
        return ''
      }).finally(() => {
        this.hospitalNameLoading = false
        this.hospitalNamePromise = null
      })
      
      return this.hospitalNamePromise
    },
    
    // 确保医院名称已加载（用于打印前检查）
    ensureHospitalNameLoaded() {
      if (this.hospitalName) {
        return Promise.resolve(this.hospitalName)
      }
      return this.getHospitalName()
    }
  }
}

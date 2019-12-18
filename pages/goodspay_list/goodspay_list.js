// pages/goods_list/goods_list.js
import WxParse from '../../wxParse/wxParse.js';
import util from '../../utils/util.js';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hostUrl: app.globalData.hostUrl,
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    productList: [],
    page: 0, //页码
    winHeight: "", //窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    isGet: true, //是否可以请求
    hidden: true, //加载弹框显示 
    showModel: true,
    showCeng: true,
    typeId: '',
    switchTabOne: true,
    switchTabTwo: false,
    switchTabThree: false,
    switchTabFour: false,
    switchTabFive: false,
    word: app.globalData.word,
    nowproid:0,
    quantity: 1,
    stock: 0,
    orderid:0,
    dTotal:0,
    dPayJine:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.typeId) {
      app.globalData.typeId = options.typeId;
    };
    if (options.payjine) {
      app.globalData.payjine = options.payjine;
    }
    var that = this;
    that.setData({
      orderid:options.orderid,
      dPayJine:options.payjine,
    })
  },

  closeAllLayer: function () {
    this.setData({
      showModel: true,
      showCeng: true
    })
  },
  chooseModel: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    console.log(id);
    that.setData({
      nowproid: id,
      showCeng: false,
      showModel: false
    });
    that.getInfo();
  },
  jian: function (e) { //减
    var that = this;
    if (that.data.quantity > 1) {
      that.setData({
        quantity: that.data.quantity - 1,
      })
    } else {
      wx.showToast({
        title: '数量不能为0',
        icon: 'error',
        duration: 2000
      })
    }
  },
  jia: function (e) { //加
    var that = this;
    if (that.data.quantity < that.data.stock) {
      that.setData({
        quantity: that.data.quantity + 1,
      })
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'error',
        duration: 2000
      })
    }
  },
  orderProductCart: function (e) { //加入购物车
    var that = this;
    var id = e.currentTarget.dataset.id;
    var userId = wx.getStorageSync('userId');
    if (userId != null && userId > 0 && userId != '') {
      that.addOrderCart(id, userId, that.data.quantity, 1, e.currentTarget.dataset.unit);
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '先登录',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/mine/mine',
            })
          } else if (res.cancel) { }
        }
      })
    }
  },
  addOrderCart: function (id, userId, quantity, isChecked, unit) { //读取详细
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'addOrderProCart',
        id: id,
        userId: userId,
        quantity: quantity,
        isChecked: isChecked,
        unit: unit,
        orderid:this.data.orderid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          if (res.data.status == 0 && isChecked == 1) {
            wx.showToast({
              title: '加入成功',
              icon: 'success',
              duration: 2000
            })
            that.closeAllLayer();
            that.setData({
              showModel: true,
              showCeng: true,
              dTotal:res.data.totalprice,
            });
          } else if (res.data.status == 0 && isChecked == 2) {
            wx.navigateTo({
              url: '/pages/con_order/con_order?proid=' + id,
              id: id,
            })
          } else {
            wx.showToast({
              title: '失败',
              icon: 'error',
              duration: 2000
            })
          }
        }
      }
    })
  },
  payNow:function(){
    var that=this;
    console.log(that.data.dTotal + "," + that.data.dPayJine)
    if (that.data.dTotal < that.data.dPayJine){
      wx.showToast({
        title: '所选产品金额小于支付金额',
        icon: 'success',
        duration: 2000
      })
    }
    else{

      wx.request({
        url: app.globalData.apiUrl,
        data: {
          opt: 'OrderPayProduct',
          userId: wx.getStorageSync('userId'),
          orderid: this.data.orderid,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data != null) {
            if (res.data.status> 0) {
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 2000,
                success:function(){
                  wx.navigateTo({
                    url: '/pages/order_details/order_details?id='+res.data.status,
                  })
                }
              });
              ///pages/order_details/order_details?id=res.data.status
              }
              else{
              wx.showToast({
                title: '支付失败',
                icon: 'success',
                duration: 2000
              })
              }
              }
              }
              });
    }
  },
  getInfo: function () { //读取详细
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'getProductInfo',
        id: that.data.nowproid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          that.setData({
            model: res.data,
            stock: res.data.stock,
            content: WxParse.wxParse('content', 'html', res.data.content, that),
            minprice: (res.data.marketPrice - res.data.price).toFixed(2),
          })
          wx.setNavigationBarTitle({
            title: res.data.name
          });
        }
      }
    })
  },
  choice: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    console.log(id);
    that.setData({
      nowproid:id,
    });
    that.getInfo();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  payjine:function(d){
    payjine: d;
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    var that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR - 180;
        that.setData({
          winHeight: calc,
          scrollHeight: res.windowHeight,
          page: 0,
          productList: [],
        });

      }
    });
    this.getProductList(); //列表
  },
  getOrderProductCartList: function () { //读取购物车
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'getOrderProductCartList',
        userId: wx.getStorageSync('userId'),
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          that.setData({
            ordercartList: res.data,
          })
        }
      }
    })
  },
  getProductList: function () { //读取列表
    var that = this;
    var page = that.data.page + 1;
    this.setData({
      hidden: false,
      isGet: false,
    });
    var where = '1=1 ';
    if (app.globalData.payjine){
      where = where + " and price<=" + app.globalData.payjine;
    }
    if (app.globalData.word != '') {
      where = where + " and name like '%" + app.globalData.word + "%'";
    }
    if (app.globalData.typeId != '') {
      where = where + "and typeId =" + app.globalData.typeId;
    }
    var order = '';
    if (that.data.switchTabOne) {
      order = ' ';
    }
    if (that.data.switchTabTwo) {
      order = '';
    }
    if (that.data.switchTabThree) {
      order = order + ' price asc,';
    }
    if (that.data.switchTabFour) {
      order = order + 'sales desc,';
    }
    if (that.data.switchTabFive) {
      order = order + 'createdTime desc,';
    }
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'getProductPageList',
        orderBy: order,
        where: where,
        page: page,
        size: 8,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data) {
          var list = that.data.productList;
          var newList = res.data;
          if (newList.length > 0) {
            for (var i in newList) {
              list.push(newList[i]);
            }
            that.setData({
              productList: list,
              isGet: true,
              hidden: true,
              page: page,
            });
          }
        } else {
          that.setData({
            isGet: false,
            hidden: true,
          })
        }

      }
    });
  },
  //页面滑动到底部
  bindDownLoad: function () {
    if (this.data.isGet) {
      this.getProductList();
    }
  },
  //输入内容时
  searchActiveChangeinput: function (e) {
    const val = e.detail.value;
    app.globalData.word = val;
  },
  //搜索提交
  searchSubmit: function () {
    wx.navigateTo({
      url: '/pages/goods_list/goods_list'
    })
  },
  switchTab: function (e) {
    var that = this;
    if (e.currentTarget.dataset.order == 1) {
      that.setData({
        page: 0,
        productList: [],
        switchTabOne: true,
        switchTabTwo: false,
        switchTabThree: false,
        switchTabFour: false,
        switchTabFive: false,
      }, function () {
        that.getProductList();
      });
    } else if (e.currentTarget.dataset.order == 2) {
      that.setData({
        page: 0,
        productList: [],
        switchTabOne: false,
        switchTabTwo: true,
        switchTabThree: false,
        switchTabFour: false,
        switchTabFive: false,
      }, function () {
        that.getProductList();
      });

    } else if (e.currentTarget.dataset.order == 3) {
      that.setData({
        page: 0,
        productList: [],
        switchTabOne: false,
        switchTabTwo: false,
        switchTabThree: true,
        switchTabFour: false,
        switchTabFive: false,
      }, function () {
        that.getProductList();
      });

    } else if (e.currentTarget.dataset.order == 4) {
      that.setData({
        page: 0,
        productList: [],
        switchTabOne: false,
        switchTabTwo: false,
        switchTabThree: false,
        switchTabFour: true,
        switchTabFive: false,
      }, function () {
        that.getProductList();
      });

    } else if (e.currentTarget.dataset.order == 5) {
      that.setData({
        page: 0,
        productList: [],
        switchTabOne: false,
        switchTabTwo: false,
        switchTabThree: false,
        switchTabFour: false,
        switchTabFive: true,
      }, function () {
        that.getProductList();
      });

    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
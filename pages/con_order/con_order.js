// pages/con_order/con_order.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hostUrl: app.globalData.hostUrl,
    shipping_method: '送货上门',
    recommended_code: '',
    note: '',
    shippingMethodActive: 2,
    address: '',
    addressId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var userId = wx.getStorageSync('userId');
    if (userId != null && userId > 0 && userId != '') {
      that.getCartList(); //读取购物车
      that.dTotal(); //读取金额
      that.getAddressList();

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
  checkBeiKe: function () {
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'checkBeiKe',
        userid: wx.getStorageSync('userId'),
        jine: that.data.dTotal,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.showToast({
            title: '贝壳不足!', //这里打印出登录成功
            icon: 'success',
            duration: 1000,
          })
        } else {

        }
      }
    })
  },
  getShangJiaBandProList: function () {
    //var proid = e.currentTarget.dataset.proid;
    console.log(data.proid)
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'getShangJiaBandProList',
        id: data.proid,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          that.setData({
            ShangJiaBandProlist: res.data,
          })
        }
      }
    })
  },
  getCartList: function () { //读取购物车
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'getCartList',
        userId: wx.getStorageSync('userId'),
        where: ' and is_checked=2',
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          that.setData({
            cartList: res.data,
          })
        }
      }
    })
  },
  dTotal: function () { //读取金额
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'dTotal',
        userId: wx.getStorageSync('userId'),
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          that.setData({
            dTotal: res.data.dTotal,
            marketPriceTotal: res.data.marketPriceTotal,
            quantity: res.data.quantity,
          })
        }
      }
    })
  },
  getAddressList: function () { //读取收货地址
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'getAddressList',
        userId: wx.getStorageSync('userId'),
        where: ' and is_default=1',
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          that.setData({
            address: res.data[0].address,
            addressId: res.data[0].id,
          })
        }
      }
    })
  },
  formSubmit: function (e) { //提交
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'checkBeiKe',
        userid: wx.getStorageSync('userId'),
        jine: that.data.dTotal,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.status == 0 && e.detail.value.paymethod == "积分支付") {
          wx.showToast({
            title: '贝壳不足!', //这里打印出登录成功
            icon: 'success',
            duration: 1000,
          })
        } else {
          if (e.detail.value.shipping_method == '送货上门' && e.detail.value.addressId.length == 0) {
            wx.showToast({
              title: '收货地址不得为空!',
              icon: 'loading',
              duration: 1500
            })
          } else {
            wx.request({
              url: app.globalData.apiUrl, //接口地址
              data: {
                opt: 'addOrder',
                userId: wx.getStorageSync('userId'),
                addressId: e.detail.value.addressId,
                quantity_sum: e.detail.value.quantity_sum,
                price_sum: e.detail.value.price_sum,
                shipping_method: e.detail.value.shipping_method,
                recommended_code: e.detail.value.recommended_code,
                note: e.detail.value.note,
                paymethod: e.detail.value.paymethod,
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                if (res.data.status > 0) {
                  console.log(e.detail.value.paymethod);
                  if (e.detail.value.paymethod == "积分支付") {
                    wx.request({
                      url: app.globalData.apiUrl,
                      data: {
                        opt: 'PayBeiKe',
                        userId: wx.getStorageSync('userId'),
                        orderid: res.data.status
                      },
                      header: {
                        'content-type': 'application/json'
                      },
                      success: function (res) {
                        if (res.data.status == 0) {
                          wx.showToast({
                            title: '支付成功!', //这里打印出登录成功
                            icon: 'success',
                            duration: 1000,
                            success: function () {
                              wx.navigateTo({
                                url: '/pages/order/order',
                              })
                            }
                          })
                        } else {
                          wx.showToast({
                            title: res.data.msg, //这里打印出登录成功
                            icon: 'success',
                            duration: 1000,
                            success: function () {
                              wx.navigateTo({
                                url: '/pages/order/order',
                              })
                            }
                          })

                        }
                      }
                    })
                  } else if (e.detail.value.paymethod == '商品支付') {
                    wx.navigateTo({
                      url: '/pages/goodspay_list/goodspay_list?orderid=' + res.data.status + '&payjine=' + e.detail.value.price_sum,
                    })
                  } else {
                    that.pay_weixin(res.data.status);
                    wx.showToast({
                      title: '支付成功!', //这里打印出登录成功
                      icon: 'success',
                      duration: 1000
                    })
                  }
                  // wx.showToast({
                  //   title: '提交成功!',//这里打印出登录成功
                  //   icon: 'success',
                  //   duration: 1000,
                  //   success:function(){
                  //     wx.navigateTo({
                  //       url: '/pages/order/order',
                  //     })
                  //   }
                  // })
                } else {
                  wx.showToast({
                    title: '提交失败!',
                    icon: 'loading',
                    duration: 1500
                  })
                }
              }
            })
          }
        }
      }
    })

  },
  radioChange: function (d) {
    //console.log(d);
    console.log('radio发生change事件，携带value值为：', d.detail.value);
    //var prioid = e.currentTarget.dataset.proid;
    this.setData({
      paymethod: d.detail.value
    });
    if (d.detail.value == "积分支付") {
      //this.getShangJiaBandProList(data.proid);

    }


  },
  pay_beike: function (d) { //积分支付
  },
  pay_dikou: function (d) { //商品抵扣

  },
  pay_weixin: function (id) { //支付
    var that = this;
    wx.request({
      url: app.globalData.apiUrl,
      data: {
        opt: 'GetUnifiedOrderResult',
        userId: wx.getStorageSync('userId'),
        id: id,
        typeId: 1,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data != null) {
          console.log(res.data)
          wx.requestPayment({
            'timeStamp': res.data.timeStamp,
            'nonceStr': res.data.nonceStr,
            'package': res.data.package,
            'signType': 'MD5',
            'paySign': res.data.paySign,
            'success': function (res) {
              wx.request({
                url: app.globalData.apiUrl,
                data: {
                  opt: 'PaySuccess',
                  userId: wx.getStorageSync('userId'),
                  orderid:id,
                },
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  wx.redirectTo({
                    url: '/pages/order/order',
                  })
                }
              })
             
            },
            'fail': function (res) {
              wx.redirectTo({
                url: '/pages/order/order',
              })
            },
            'complete': function (res) {
              wx.redirectTo({
                url: '/pages/order/order',
              })
            }
          })
        }
      }
    })
  },
  shippingMethod: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    if (id == 1) {
      that.setData({
        shippingMethodActive: 1,
        shipping_method: '门店自提',
      }, function () { })
    } else if (id == 2) {
      that.setData({
        shippingMethodActive: 2,
        shipping_method: '送货上门',
      }, function () { })
    }
  },
  addAddress: function () {
    wx.navigateTo({
      url: '/pages/selectAddress/selectAddress',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
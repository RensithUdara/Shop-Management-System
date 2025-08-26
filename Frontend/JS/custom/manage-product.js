var productModal = $("#productModal");
    $(function () {

        //JSON data by API call
        $.get(productListApiUrl, function (response) {
            if(response) {
                var table = '';
                $.each(response, function(index, product) {
                    table += '<tr data-id="'+ product.product_id +'" data-name="'+ product.product_name +'" data-unit="'+ product.unit +'" data-price="'+ product.price_per_unit +'">' +
                        '<td>'+ product.product_name +'</td>'+
                        '<td>'+ product.uom_name +'</td>'+
                        '<td>'+ product.price_per_unit +'</td>'+
                        '<td><span class="btn btn-xs btn-danger delete-product">Delete</span> <span id="editProduct uniqueEdit"  class="btn btn-xs btn-danger btn-edit-product" data-toggle="modal" data-target="#productModal2" style="border: orange;">Edit</span></td></tr>';
                });
                $("table").find('tbody').empty().html(table);
            }
        });
    });

    // Save Product
    $("#saveProduct").on("click", function () {
        
        // If we found id value in form then update product detail
        var data = $("#productForm").serializeArray();
        var requestPayload = {
            product_name: null,
            Unit: null,
            Price_per_unit: null
        };
        for (var i=0;i<data.length;++i) {
            var element = data[i];
            switch(element.name) {
                case 'name':
                    requestPayload.product_name = element.value;
                    break;
                case 'uoms':
                    requestPayload.Unit = element.value;
                    break;
                case 'price':
                    requestPayload.Price_per_unit = element.value;
                    break;
            }
        }
        callApi("POST", productSaveApiUrl, {
            'data': JSON.stringify(requestPayload)
        });
    });

    $("#editProduct").on("click", function () {
    var dataEdit = $("#editProductForm").serializeArray();
    
    var requestPayload = {
        product_id: $("#productModal2 #id").val(),
        product_name: null,
        Unit: null,
        Price_per_unit: null
    };

    

    for (var i=0; i<dataEdit.length; ++i) {
        var element = dataEdit[i];
        switch(element.name) {
            case 'name':
                requestPayload.product_name = element.value;
                break;
            case 'uoms':
                requestPayload.Unit = element.value;
                break;
            case 'price':
                requestPayload.Price_per_unit = element.value;
                break;
        }
    }
console.log(dataEdit)
    // Always update for Edit modal
    callApi("POST", productUpdateApiUrl, {
        'data': JSON.stringify(requestPayload)
    });

    $("#productModal2").modal("hide");
});




    $(document).on("click", ".delete-product", function (){
        var tr = $(this).closest('tr');
        var data = {
            product_id : tr.data('id')
        };
        var isDelete = confirm("Are you sure to delete "+ tr.data('name') +" item?");
        if (isDelete) {
            callApi("POST", productDeleteApiUrl, data);
        }
    });

    productModal.on('hide.bs.modal', function(){
        $("#id").val('0');
        $("#name, #unit, #price").val('');
        productModal.find('.modal-title').text('Add New Product');
    });

    productModal.on('show.bs.modal', function(){
        //JSON data by API call
        $.get(uomListApiUrl, function (response) {
            if(response) {
                var options = '<option value="">--Select--</option>';
                $.each(response, function(index, unit) {
                    options += '<option value="'+ unit.unit_id +'">'+ unit.unit_name +'</option>';
                });
                $("#uoms").empty().html(options);
            }
        });
    });

    // When clicking Edit button
    $(document).on("click", ".btn-edit-product", function () {
        var tr = $(this).closest('tr');  // get row data

        // Fill modal fields
        //$("#productModal2 #id").val(tr.data("id"));
        console.log(tr.data)
        $("#productModal2 #id").val(tr.data("id")); 
        $("#productModal2 #name").val(tr.data("name"));
        $("#productModal2 #price").val(tr.data("price"));

        // Load unit options
        $.get(uomListApiUrl, function (response) {
            if (response) {
                var options = '<option value="">--Select--</option>';
                $.each(response, function(index, unit) {
                    options += '<option value="'+ unit.unit_id +'">'+ unit.unit_name +'</option>';
                });
                $("#productModal2 #uoms").empty().html(options);
                $("#productModal2 #uoms").val(tr.data("unit")); // set current unit
            }
        });
    });
